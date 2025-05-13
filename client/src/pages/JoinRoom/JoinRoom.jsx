import { useEffect } from 'react';

function getOrCreateUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    if (window.crypto && window.crypto.randomUUID) {
      userId = window.crypto.randomUUID();
    } else {
      userId = Math.random().toString(36).substr(2, 12);
    }
    localStorage.setItem('userId', userId);
  }
  return userId;
}

const userId = getOrCreateUserId();
socket.emit('join', { userId, name, roomCode }); 