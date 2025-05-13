const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
const socket = io(SERVER_URL);

const name = 'TestUser';
const roomCode = 'ROOM123';

socket.on('connect', () => {
  console.log('Connected as', socket.id);
  socket.emit('join', { name, roomCode });
});

socket.on('room_update', (room) => {
  console.log('Room update:', JSON.stringify(room, null, 2));
});

// Optionally, test other events after a delay
// setTimeout(() => {
//   socket.emit('set_story', { roomCode, story: 'JIRA-123: Test story' });
//   socket.emit('start_pointing', { roomCode });
//   socket.emit('submit_point', { roomCode, point: 3 });
// }, 2000); 