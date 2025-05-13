import { io } from 'socket.io-client';

// Change this to your backend URL if deploying
const BACKEND_URL = 'http://localhost:3001';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL);
  }
  return socket;
} 