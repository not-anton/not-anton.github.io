import { io } from 'socket.io-client';

// Backend URL: set VITE_BACKEND_URL (e.g. http://localhost:3001 for local dev)
// to override the deployed backend.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://pointless-erqk.onrender.com';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(BACKEND_URL, {
      // Default transports: HTTP long-polling first, upgrading to websocket.
      // This gives a working fallback on networks/proxies that block
      // websockets (the old websocket-only config had none).
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socket;
}
