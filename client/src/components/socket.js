import { io } from 'socket.io-client';

// Change this to your backend URL if deploying
const BACKEND_URL = 'https://a64c-2601-19b-200-bd40-e408-fe8a-11d8-84a5.ngrok-free.app';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL);
  }
  return socket;
} 