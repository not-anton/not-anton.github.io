// Integration test for the Point-Less server.
// Run with: npm test  (spins the server up on an ephemeral port)
process.env.DISCONNECT_GRACE_MS = '300';

const assert = require('assert');
const { server, rooms } = require('./index.js');
const { io } = require('socket.io-client');

const ROOM = 'TESTROOM1';
const GRACE = 300;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function connect(port) {
  return new Promise((resolve, reject) => {
    const sock = io(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    sock.on('connect', () => resolve(sock));
    sock.on('connect_error', reject);
  });
}

// Resolve with the first room_update matching the predicate. Subscribe
// BEFORE triggering the action so no update is missed.
function nextUpdate(sock, predicate, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      sock.off('room_update', handler);
      reject(new Error(`timeout waiting for room_update: ${label}`));
    }, 3000);
    const handler = (room) => {
      if (predicate(room)) {
        clearTimeout(timer);
        sock.off('room_update', handler);
        resolve(room);
      }
    };
    sock.on('room_update', handler);
  });
}

// Assert that no room_update matching the predicate arrives within `ms`.
async function assertNoUpdate(sock, predicate, label, ms = 300) {
  let bad = null;
  const handler = (room) => { if (predicate(room)) bad = room; };
  sock.on('room_update', handler);
  await sleep(ms);
  sock.off('room_update', handler);
  assert(!bad, `unexpected room_update: ${label}`);
}

let passed = 0;
function ok(label) {
  passed++;
  console.log(`  ok ${passed} - ${label}`);
}

async function main() {
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`test server on port ${port}`);

  // --- join & host assignment ---
  const sockA = await connect(port);
  let p = nextUpdate(sockA, r => r.users.uA, 'A joins');
  sockA.emit('join', { userId: 'uA', name: 'Alice', roomCode: ROOM });
  let room = await p;
  assert.strictEqual(room.hostId, 'uA');
  assert.strictEqual(room.users.uA.isHost, true);
  ok('first user to join becomes host');

  const sockB = await connect(port);
  p = nextUpdate(sockA, r => r.users.uB, 'B joins');
  sockB.emit('join', { userId: 'uB', name: 'Bob', roomCode: ROOM });
  room = await p;
  assert.strictEqual(room.hostId, 'uA');
  assert.strictEqual(room.users.uB.isHost, false);
  ok('second user does not take host');

  // --- host transfer survives later joins ---
  p = nextUpdate(sockA, r => r.hostId === 'uB', 'transfer to B');
  sockA.emit('transfer_host', { roomCode: ROOM, targetUserId: 'uB' });
  await p;
  ok('host transfer works');

  const sockC = await connect(port);
  p = nextUpdate(sockA, r => r.users.uC, 'C joins');
  sockC.emit('join', { userId: 'uC', name: 'Cara', roomCode: ROOM });
  room = await p;
  assert.strictEqual(room.hostId, 'uB', 'host must not reset to first joiner when someone joins');
  ok('host transfer survives a new user joining (old ensureSingleHost bug)');

  // --- anyone can move the crown (grab it off the host's head) ---
  p = nextUpdate(sockA, r => r.hostId === 'uC', 'C grabs the crown');
  sockC.emit('transfer_host', { roomCode: ROOM, targetUserId: 'uC' });
  await p;
  ok('non-host member can move the crown');
  p = nextUpdate(sockA, r => r.hostId === 'uB', 'crown back to B');
  sockC.emit('transfer_host', { roomCode: ROOM, targetUserId: 'uB' });
  await p;
  ok('crown can be passed on again');

  // --- story: host only ---
  const noStory = assertNoUpdate(sockA, r => r.story === 'hacked', 'non-host set_story applied');
  sockC.emit('set_story', { roomCode: ROOM, story: 'hacked' });
  await noStory;
  ok('non-host cannot set story');

  p = nextUpdate(sockA, r => r.story === 'real story', 'host sets story');
  sockB.emit('set_story', { roomCode: ROOM, story: 'real story' });
  await p;
  ok('host can set story');

  // --- pointing round ---
  p = nextUpdate(sockA, r => r.pointingActive, 'pointing starts');
  sockB.emit('start_pointing', { roomCode: ROOM });
  await p;
  ok('host can start pointing');

  const noInvalid = assertNoUpdate(sockA, r => r.users.uA.hasVoted, 'invalid point accepted');
  sockA.emit('submit_point', { roomCode: ROOM, point: 4 });
  await noInvalid;
  ok('invalid point value is rejected');

  p = nextUpdate(sockA, r => r.users.uA.hasVoted, 'A votes');
  sockA.emit('submit_point', { roomCode: ROOM, point: 5 });
  await p;
  p = nextUpdate(sockA, r => r.users.uC.hasVoted, 'C votes');
  sockC.emit('submit_point', { roomCode: ROOM, point: 3 });
  await p;
  p = nextUpdate(sockA, r => r.revealed, 'all voted -> revealed');
  sockB.emit('submit_point', { roomCode: ROOM, point: 8 });
  room = await p;
  assert.strictEqual(room.pointingActive, false);
  assert(Object.keys(room.lockInTimes).length === 3, 'lock-in times recorded');
  ok('round reveals when everyone has voted');

  // --- late joiner must not re-hide the results ---
  const sockD = await connect(port);
  p = nextUpdate(sockA, r => r.users.uD, 'D joins late');
  sockD.emit('join', { userId: 'uD', name: 'Dave', roomCode: ROOM });
  room = await p;
  assert.strictEqual(room.revealed, true, 'revealed must stay true after a late join');
  assert.strictEqual(room.users.uD.hasVoted, false);
  ok('joining after reveal keeps results revealed');

  // --- host disconnect: short blip keeps the crown ---
  p = nextUpdate(sockA, r => r.users.uB && r.users.uB.connected === false, 'B goes offline');
  sockB.disconnect();
  room = await p;
  assert.strictEqual(room.hostId, 'uB', 'host keeps crown while briefly offline');
  ok('disconnected user is marked offline immediately');

  const sockB2 = await connect(port);
  p = nextUpdate(sockA, r => r.users.uB && r.users.uB.connected === true, 'B back');
  sockB2.emit('join', { userId: 'uB', name: 'Bob', roomCode: ROOM });
  room = await p;
  assert.strictEqual(room.hostId, 'uB');
  ok('host who reconnects within grace keeps host');

  // --- host disconnect past grace: removed, then reclaims on rejoin ---
  p = nextUpdate(sockA, r => !r.users.uB, 'B removed after grace');
  sockB2.disconnect();
  room = await p;
  assert.notStrictEqual(room.hostId, 'uB');
  assert(room.users[room.hostId], 'someone else got host');
  ok('host removed after grace period, another user promoted');

  const sockB3 = await connect(port);
  p = nextUpdate(sockA, r => r.users.uB && r.users.uB.isHost, 'B reclaims host');
  sockB3.emit('join', { userId: 'uB', name: 'Bob', roomCode: ROOM });
  room = await p;
  assert.strictEqual(room.hostId, 'uB');
  ok('returning host automatically gets host back');

  // --- kick ---
  const noKick = assertNoUpdate(sockB3, r => !r.users.uC, 'non-host kick applied');
  sockA.emit('kick_user', { roomCode: ROOM, targetUserId: 'uC' });
  await noKick;
  ok('non-host cannot kick');

  const kickedP = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout waiting for kicked event')), 3000);
    sockD.on('kicked', (payload) => { clearTimeout(t); resolve(payload); });
  });
  // Remaining members are told the departure was a kick (boot animation).
  const userKickedP = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout waiting for user_kicked broadcast')), 3000);
    sockA.on('user_kicked', (payload) => { clearTimeout(t); resolve(payload); });
  });
  p = nextUpdate(sockA, r => !r.users.uD, 'D kicked');
  sockB3.emit('kick_user', { roomCode: ROOM, targetUserId: 'uD' });
  await p;
  const kickedPayload = await kickedP;
  assert.strictEqual(kickedPayload.roomCode, ROOM);
  ok('host can kick a user, who is removed immediately and notified');
  const userKickedPayload = await userKickedP;
  assert.strictEqual(userKickedPayload.userId, 'uD');
  assert.strictEqual(userKickedPayload.name, 'Dave');
  ok('room is told the departure was a kick (user_kicked broadcast)');
  sockD.disconnect();

  // --- stale-socket race: old socket disconnect must not remove the user ---
  const sockC2 = await connect(port);
  p = nextUpdate(sockA, r => r.users.uC && r.users.uC.connected === true, 'C second socket');
  sockC2.emit('join', { userId: 'uC', name: 'Cara', roomCode: ROOM });
  await p;
  sockC.disconnect(); // old socket for uC
  await sleep(GRACE + 300);
  assert(rooms[ROOM].users.uC, 'user must survive old socket disconnecting');
  assert.strictEqual(rooms[ROOM].users.uC.connected, true);
  ok('reconnect followed by stale disconnect does not drop the user');

  // --- deliberate leave is immediate ---
  p = nextUpdate(sockB3, r => !r.users.uA, 'A leaves');
  sockA.emit('leave_room', { roomCode: ROOM });
  await p;
  ok('leave_room removes the user immediately');

  // --- empty room is deleted ---
  sockB3.emit('leave_room', { roomCode: ROOM });
  sockC2.emit('leave_room', { roomCode: ROOM });
  await sleep(300);
  assert(!rooms[ROOM], 'room should be deleted when the last user leaves');
  ok('room is cleaned up when empty');

  for (const s of [sockA, sockB3, sockC2]) s.disconnect();
  console.log(`\nall ${passed} server tests passed`);
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
