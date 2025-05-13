import { io } from 'socket.io-client';

// Change this to your backend URL if deploying
const BACKEND_URL = 'https://pointless-erqk.onrender.com';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL);
  }
  return socket;
} 