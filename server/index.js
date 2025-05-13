const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'https://not-anton.github.io',
  'http://localhost:5173',
  'https://pointless-frontend.onrender.com'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// In-memory state
const rooms = {};
const socketToUserId = {}; // socket.id -> userId
const disconnectTimeouts = {}; // userId -> timeoutId

// Helper: create a new room if not exists
function getOrCreateRoom(roomCode) {
  if (!rooms[roomCode]) {
    rooms[roomCode] = {
      users: {}, // socketId: { name, isHost, point, hasVoted }
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

// Rate limiting: max 10 events per 5 seconds per socket
const RATE_LIMIT_WINDOW = 5000;
const RATE_LIMIT_MAX = 10;
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
setInterval(() => {
  for (const [code, room] of Object.entries(rooms)) {
    if (Object.keys(room.users).length === 0) {
      delete rooms[code];
    }
  }
}, 1000 * 60 * 5); // every 5 minutes

// Helper: ensure only one host (the first user in the list)
function ensureSingleHost(room) {
  const userIds = Object.keys(room.users);
  userIds.forEach((id, idx) => {
    room.users[id].isHost = idx === 0;
  });
}

io.on('connection', (socket) => {
  socket.on('join', ({ userId, name, roomCode }) => {
    if (isRateLimited(socket)) return;
    if (!/^[A-Z0-9]{8,}$/.test(roomCode)) return;
    const room = getOrCreateRoom(roomCode);
    if (!userId) return;
    // If userId already exists, update socketId
    if (room.users[userId]) {
      room.users[userId].socketId = socket.id;
      room.users[userId].name = sanitize(name); // update name in case it changed
    } else {
      room.users[userId] = { name: sanitize(name), isHost: false, point: null, hasVoted: false, socketId: socket.id };
    }
    socketToUserId[socket.id] = userId;
    // Cancel any pending disconnect removal
    if (disconnectTimeouts[userId]) {
      clearTimeout(disconnectTimeouts[userId]);
      delete disconnectTimeouts[userId];
    }
    ensureSingleHost(room);
    socket.join(roomCode);
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('set_story', ({ roomCode, story }) => {
    if (isRateLimited(socket)) return;
    const room = getOrCreateRoom(roomCode);
    const userId = socketToUserId[socket.id];
    if (!room.users[userId] || !room.users[userId].isHost) return;
    room.story = sanitize(story);
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('start_pointing', ({ roomCode }) => {
    if (isRateLimited(socket)) return;
    const room = getOrCreateRoom(roomCode);
    const userId = socketToUserId[socket.id];
    if (!room.users[userId] || !room.users[userId].isHost) return;
    room.pointingActive = true;
    room.revealed = false;
    room.lockInTimes = {};
    room.pointingStart = Date.now();
    Object.values(room.users).forEach(u => { u.point = null; u.hasVoted = false; });
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('submit_point', ({ roomCode, point }) => {
    if (isRateLimited(socket)) return;
    const room = getOrCreateRoom(roomCode);
    const userId = socketToUserId[socket.id];
    if (!room.pointingActive || !room.users[userId]) return;
    room.users[userId].point = point;
    room.users[userId].hasVoted = true;
    // Record lock-in time
    if (room.pointingStart && !room.lockInTimes[userId]) {
      room.lockInTimes[userId] = Date.now() - room.pointingStart;
    }
    // Check if all have voted
    if (Object.values(room.users).every(u => u.hasVoted)) {
      room.revealed = true;
      room.pointingActive = false;
    }
    io.to(roomCode).emit('room_update', room);
  });

  socket.on('disconnect', () => {
    const userId = socketToUserId[socket.id];
    if (!userId) return;
    // Wait 10 seconds before removing user (to allow for refresh/reconnect)
    disconnectTimeouts[userId] = setTimeout(() => {
      for (const [roomCode, room] of Object.entries(rooms)) {
        if (room.users[userId]) {
          delete room.users[userId];
          ensureSingleHost(room);
          // Robustness: If a round is active, check if all remaining users have voted
          if (room.pointingActive) {
            const userList = Object.values(room.users);
            if (userList.length > 0 && userList.every(u => u.hasVoted)) {
              room.pointingActive = false;
              room.revealed = true;
            }
          }
          io.to(roomCode).emit('room_update', room);
        }
      }
      delete disconnectTimeouts[userId];
    }, 10000);
    delete socketEventTimestamps[socket.id];
    delete socketToUserId[socket.id];
  });

  // Host transfer event
  socket.on('transfer_host', ({ roomCode, targetSocketId }) => {
    if (isRateLimited(socket)) return;
    const room = getOrCreateRoom(roomCode);
    const userId = socketToUserId[socket.id];
    // Only host can transfer host
    if (!room.users[userId] || !room.users[userId].isHost) return;
    Object.values(room.users).forEach(u => u.isHost = false);
    if (room.users[targetSocketId]) {
      room.users[targetSocketId].isHost = true;
    }
    io.to(roomCode).emit('room_update', room);
  });
});

app.get('/', (req, res) => {
  res.send('Story Expedition backend running.');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 