// Headless second participant for local demo/testing.
// Usage: node bot.js <ROOMCODE> [name] [point]
const { io } = require('socket.io-client');
const roomCode = process.argv[2];
const name = process.argv[3] || 'Bot';
const point = Number(process.argv[4]) || 3;
const sock = io('http://localhost:3001', { transports: ['websocket'] });
let voted = false;
sock.on('connect', () => {
  console.log('bot connected', sock.id);
  sock.emit('join', { userId: 'bot-' + name.toLowerCase(), name, roomCode });
});
sock.on('room_update', (room) => {
  if (room.pointingActive && !voted) {
    voted = true;
    setTimeout(() => sock.emit('submit_point', { roomCode, point }), 800);
    console.log('bot voting', point);
  }
  if (!room.pointingActive) voted = false;
});
sock.on('kicked', () => {
  console.log('bot was kicked');
  process.exit(0);
});
