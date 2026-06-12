const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'https://pointless-frontend.onrender.com',
  'https://not-anton.github.io',
  'https://point-less.work',
  'https://www.point-less.work',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;
// How long a disconnected user keeps their seat (and the host their crown)
// before being removed from the room. Overridable for tests.
const DISCONNECT_GRACE_MS = parseInt(process.env.DISCONNECT_GRACE_MS, 10) || 30000;

const ALLOWED_POINTS = [1, 2, 3, 5, 8];
const MAX_NAME_LENGTH = 24;
const MAX_STORY_LENGTH = 2000;

// In-memory state
const rooms = {}; // roomCode -> room
const socketToUserId = {}; // socket.id -> userId
const disconnectTimeouts = {}; // `${roomCode}:${userId}` -> timeoutId

// Helper: create a new room if not exists
function getOrCreateRoom(roomCode) {
  if (!rooms[roomCode]) {
    rooms[roomCode] = {
      users: {}, // userId: { name, isHost, point, hasVoted, connected, socketId }
      hostId: null, // userId of the current host
      formerHostId: null, // host who dropped out; reclaims the crown on rejoin
      story: '',
      pointingActive: false,
      revealed: false,
      lockInTimes: {},
      pointingStart: null,
    };
  }
  return rooms[roomCode];
}

// Helper: sanitize input (strip HTML tags)
function sanitize(str) {
  return String(str).replace(/<[^>]*>?/gm, '');
}

// Rate limiting: max 15 events per 5 seconds per socket.
// 'join' is exempt so reconnects are never silently dropped.
const RATE_LIMIT_WINDOW = 5000;
const RATE_LIMIT_MAX = 15;
const socketEventTimestamps = {};
function isRateLimited(socket) {
  const now = Date.now();
  if (!socketEventTimestamps[socket.id]) socketEventTimestamps[socket.id] = [];
  socketEventTimestamps[socket.id] = socketEventTimestamps[socket.id].filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (socketEventTimestamps[socket.id].length >= RATE_LIMIT_MAX) return true;
  socketEventTimestamps[socket.id].push(now);
  return false;
}

// Periodic cleanup of empty rooms
const sweepInterval = setInterval(() => {
  for (const [code, room] of Object.entries(rooms)) {
    if (Object.keys(room.users).length === 0) {
      delete rooms[code];
    }
  }
}, 1000 * 60 * 5); // every 5 minutes
sweepInterval.unref();

// Keep hostId valid and mirror it onto users' isHost flags.
// Never steals the crown from an existing host (unlike the old
// ensureSingleHost, which reset the host to insertion order on every join).
function syncHost(room) {
  if (!room.users[room.hostId]) {
    const ids = Object.keys(room.users);
    const connectedIds = ids.filter(id => room.users[id].connected);
    room.hostId = connectedIds[0] || ids[0] || null;
  }
  for (const [id, u] of Object.entries(room.users)) {
    u.isHost = id === room.hostId;
  }
}

// If a round is active and everyone left has voted, reveal.
function maybeFinishRound(room) {
  if (!room.pointingActive) return;
  const users = Object.values(room.users);
  if (users.length > 0 && users.every(u => u.hasVoted)) {
    room.pointingActive = false;
    room.revealed = true;
  }
}

function clearRemovalTimer(roomCode, userId) {
  const key = `${roomCode}:${userId}`;
  if (disconnectTimeouts[key]) {
    clearTimeout(disconnectTimeouts[key]);
    delete disconnectTimeouts[key];
  }
}

// Remove a user from a room. allowHostReclaim lets a host who merely lost
// connection take the crown back when they rejoin; kicks and deliberate
// leaves do not get that privilege.
function removeUser(roomCode, userId, { allowHostReclaim = false } = {}) {
  const room = rooms[roomCode];
  if (!room || !room.users[userId]) return;
  clearRemovalTimer(roomCode, userId);
  const wasHost = room.hostId === userId;
  delete room.users[userId];
  delete room.lockInTimes[userId];
  if (wasHost) {
    room.formerHostId = allowHostReclaim ? userId : null;
  }
  syncHost(room);
  maybeFinishRound(room);
  if (Object.keys(room.users).length === 0) {
    delete rooms[roomCode];
  } else {
    io.to(roomCode).emit('room_update', room);
  }
}

function scheduleRemoval(roomCode, userId) {
  const key = `${roomCode}:${userId}`;
  clearRemovalTimer(roomCode, userId);
  disconnectTimeouts[key] = setTimeout(() => {
    delete disconnectTimeouts[key];
    const room = rooms[roomCode];
    // Only remove if they are still gone.
    if (room && room.users[userId] && !room.users[userId].connected) {
      removeUser(roomCode, userId, { allowHostReclaim: true });
    }
  }, DISCONNECT_GRACE_MS);
}

io.on('connection', (socket) => {
  socket.on('join', (payload = {}) => {
    const { userId, name, roomCode } = payload;
    if (typeof roomCode !== 'string' || !/^[A-Z0-9]{8,12}$/.test(roomCode)) return;
    if (typeof userId !== 'string' || !userId || userId.length > 64) return;
    const cleanName = sanitize(name).trim().slice(0, MAX_NAME_LENGTH);
    if (!cleanName) return;
    const room = getOrCreateRoom(roomCode);
    const existing = room.users[userId];
    if (existing) {
      existing.socketId = socket.id;
      existing.name = cleanName;
      existing.connected = true;
    } else {
      room.users[userId] = {
        name: cleanName,
        isHost: false,
        point: null,
        hasVoted: false,
        connected: true,
        socketId: socket.id,
      };
    }
    socketToUserId[socket.id] = userId;
    clearRemovalTimer(roomCode, userId);
    // First user in the room becomes host; a host who dropped out and
    // came back reclaims the crown.
    if (!room.hostId) room.hostId = userId;
    if (room.formerHostId === userId) {
      room.hostId = userId;
      room.formerHostId = null;
    }
    syncHost(room);
    socket.join(roomCode);
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('set_story', (payload = {}) => {
    const { roomCode, story } = payload;
    if (isRateLimited(socket)) return;
    const room = rooms[roomCode];
    const userId = socketToUserId[socket.id];
    if (!room || !userId || room.hostId !== userId) return;
    room.story = sanitize(story).slice(0, MAX_STORY_LENGTH);
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('start_pointing', (payload = {}) => {
    const { roomCode } = payload;
    if (isRateLimited(socket)) return;
    const room = rooms[roomCode];
    const userId = socketToUserId[socket.id];
    if (!room || !userId || room.hostId !== userId) return;
    room.pointingActive = true;
    room.revealed = false;
    room.lockInTimes = {};
    room.pointingStart = Date.now();
    Object.values(room.users).forEach(u => { u.point = null; u.hasVoted = false; });
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('submit_point', (payload = {}) => {
    const { roomCode, point } = payload;
    if (isRateLimited(socket)) return;
    const room = rooms[roomCode];
    const userId = socketToUserId[socket.id];
    if (!room || !userId || !room.pointingActive || !room.users[userId]) return;
    if (!ALLOWED_POINTS.includes(point)) return;
    room.users[userId].point = point;
    room.users[userId].hasVoted = true;
    // Record lock-in time
    if (room.pointingStart && !room.lockInTimes[userId]) {
      room.lockInTimes[userId] = Date.now() - room.pointingStart;
    }
    maybeFinishRound(room);
    io.to(roomCode).emit('room_update', room);
  });

  // Host transfer event. Any member of the room can move the crown (the UI
  // models this as grabbing the crown off the host's head and dropping it on
  // someone). The target key is a userId; targetSocketId is accepted as an
  // alias for backwards compatibility with older clients.
  socket.on('transfer_host', (payload = {}) => {
    const { roomCode, targetUserId, targetSocketId } = payload;
    if (isRateLimited(socket)) return;
    const room = rooms[roomCode];
    const userId = socketToUserId[socket.id];
    if (!room || !userId || !room.users[userId]) return;
    const target = targetUserId || targetSocketId;
    if (!room.users[target]) return;
    room.hostId = target;
    room.formerHostId = null; // deliberate transfer, old host has no claim
    syncHost(room);
    io.to(roomCode).emit('room_update', room);
  });

  // Host can kick a user (e.g. a ghost that never timed out).
  socket.on('kick_user', (payload = {}) => {
    const { roomCode, targetUserId } = payload;
    if (isRateLimited(socket)) return;
    const room = rooms[roomCode];
    const userId = socketToUserId[socket.id];
    if (!room || !userId || room.hostId !== userId) return;
    if (!room.users[targetUserId] || targetUserId === userId) return;
    const targetSocketId = room.users[targetUserId].socketId;
    // Tell the room this departure is a kick (clients play the boot
    // animation instead of the regular poof). Sent before the room_update
    // that removes the user so clients can tag the departure.
    io.to(roomCode).emit('user_kicked', { roomCode, userId: targetUserId, name: room.users[targetUserId].name });
    removeUser(roomCode, targetUserId);
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.emit('kicked', { roomCode });
      targetSocket.leave(roomCode);
    }
  });

  // Deliberate exit (client navigates away from the room).
  socket.on('leave_room', (payload = {}) => {
    const { roomCode } = payload;
    const room = rooms[roomCode];
    const userId = socketToUserId[socket.id];
    if (!room || !userId || !room.users[userId]) return;
    // Ignore if this socket no longer owns the seat (another tab took over).
    if (room.users[userId].socketId !== socket.id) return;
    socket.leave(roomCode);
    removeUser(roomCode, userId);
  });

  socket.on('disconnect', () => {
    const userId = socketToUserId[socket.id];
    delete socketToUserId[socket.id];
    delete socketEventTimestamps[socket.id];
    if (!userId) return;
    for (const [roomCode, room] of Object.entries(rooms)) {
      const u = room.users[userId];
      // Skip stale disconnects: if the user already reconnected with a new
      // socket, this old socket's disconnect must not mark them offline.
      if (!u || u.socketId !== socket.id) continue;
      u.connected = false;
      io.to(roomCode).emit('room_update', room);
      scheduleRemoval(roomCode, userId);
    }
  });
});

app.get('/', (req, res) => {
  res.send('Story Expedition backend running.');
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server, io, rooms };
