import Room from './Room';

const mockRoom = {
  users: {
    'socket1': { name: 'Alice', isHost: true, point: null, hasVoted: false },
    'socket2': { name: 'Bob', isHost: false, point: null, hasVoted: false },
  },
  story: '',
  pointingActive: false,
  revealed: false,
};

const mockSocket = { id: 'socket1', on: () => {}, emit: () => {} };

export default {
  title: 'Room/Host',
  component: Room,
};

export const HostView = () => (
  <Room user={{ name: 'Alice', roomCode: 'ABC123' }} room={mockRoom} socket={mockSocket} />
);

export const NonHostView = () => (
  <Room user={{ name: 'Bob', roomCode: 'ABC123' }} room={mockRoom} socket={{ ...mockSocket, id: 'socket2' }} />
); 