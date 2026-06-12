import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Shared fake socket; handlers are captured so tests can fire server events.
const handlers = {};
const fakeSocket = {
  connected: true,
  emit: vi.fn(),
  on: vi.fn((event, fn) => {
    (handlers[event] || (handlers[event] = [])).push(fn);
  }),
  off: vi.fn((event, fn) => {
    handlers[event] = (handlers[event] || []).filter(f => f !== fn);
  }),
};

vi.mock('../../utils/socket.js', () => ({
  getSocket: () => fakeSocket,
}));

import Room from './index.jsx';

function serverEmits(event, payload) {
  (handlers[event] || []).slice().forEach(fn => fn(payload));
}

function renderRoom(path = '/room/ROOMCODE1?name=Alice') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/room/:roomCode" element={<Room />} />
        <Route path="/join/:roomCode" element={<div>JOIN PAGE</div>} />
        <Route path="/" element={<div>HOME PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const baseRoom = () => ({
  users: {
    'user-alice': { name: 'Alice', isHost: true, point: null, hasVoted: false, connected: true },
    'user-bob': { name: 'Bob', isHost: false, point: null, hasVoted: false, connected: true },
  },
  hostId: 'user-alice',
  story: '',
  pointingActive: false,
  revealed: false,
  lockInTimes: {},
});

beforeEach(() => {
  localStorage.setItem('userId', 'user-alice');
  for (const key of Object.keys(handlers)) delete handlers[key];
  fakeSocket.emit.mockClear();
  fakeSocket.connected = true;
});

describe('Room', () => {
  it('joins on mount and renders the room after a room_update', async () => {
    renderRoom();
    expect(screen.getByText(/loading room/i)).toBeInTheDocument();
    expect(fakeSocket.emit).toHaveBeenCalledWith('join', {
      userId: 'user-alice',
      name: 'Alice',
      roomCode: 'ROOMCODE1',
    });
    await act(async () => serverEmits('room_update', baseRoom()));
    // Names appear on both faces of each player card.
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
  });

  it('re-emits join when the socket reconnects', async () => {
    renderRoom();
    await act(async () => serverEmits('room_update', baseRoom()));
    fakeSocket.emit.mockClear();
    await act(async () => serverEmits('disconnect'));
    expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
    await act(async () => serverEmits('connect'));
    expect(fakeSocket.emit).toHaveBeenCalledWith('join', expect.objectContaining({
      userId: 'user-alice',
      roomCode: 'ROOMCODE1',
    }));
    expect(screen.queryByText(/connection lost/i)).not.toBeInTheDocument();
  });

  it('navigates home when kicked', async () => {
    renderRoom();
    await act(async () => serverEmits('room_update', baseRoom()));
    await act(async () => serverEmits('kicked', { roomCode: 'ROOMCODE1' }));
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('keeps points visible when a late joiner has not voted (regression)', async () => {
    renderRoom();
    const room = baseRoom();
    room.users['user-alice'].hasVoted = true;
    room.users['user-alice'].point = 5;
    room.users['user-bob'].hasVoted = true;
    room.users['user-bob'].point = 3;
    room.users['user-carol'] = { name: 'Carol', isHost: false, point: null, hasVoted: false, connected: true };
    room.revealed = true;
    await act(async () => serverEmits('room_update', room));
    // Points stay rendered even though Carol (late joiner) has not voted.
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('LOCKED IN')).not.toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('lets the host drag the boot onto a player to kick them', async () => {
    const { container } = renderRoom();
    await act(async () => serverEmits('room_update', baseRoom()));
    const boot = screen.getByLabelText('Kick boot');
    const bobCard = container.querySelector('[data-user-id="user-bob"]');
    document.elementFromPoint = vi.fn(() => bobCard);
    fireEvent.pointerDown(boot, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 200, clientY: 300 });
    fireEvent.pointerUp(window);
    expect(fakeSocket.emit).toHaveBeenCalledWith('kick_user', {
      roomCode: 'ROOMCODE1',
      targetUserId: 'user-bob',
    });
  });

  it('does not kick when the boot is dropped on empty space', async () => {
    renderRoom();
    await act(async () => serverEmits('room_update', baseRoom()));
    const boot = screen.getByLabelText('Kick boot');
    document.elementFromPoint = vi.fn(() => document.body);
    fireEvent.pointerDown(boot, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 200, clientY: 300 });
    fireEvent.pointerUp(window);
    expect(fakeSocket.emit).not.toHaveBeenCalledWith('kick_user', expect.anything());
  });

  it('shows no boot for non-hosts', async () => {
    localStorage.setItem('userId', 'user-bob');
    renderRoom('/room/ROOMCODE1?name=Bob');
    await act(async () => serverEmits('room_update', baseRoom()));
    expect(screen.queryByLabelText('Kick boot')).not.toBeInTheDocument();
  });

  it('lets anyone drag the crown off the host onto another player', async () => {
    localStorage.setItem('userId', 'user-bob'); // Bob is NOT host
    const { container } = renderRoom('/room/ROOMCODE1?name=Bob');
    await act(async () => serverEmits('room_update', baseRoom()));
    const crown = screen.getByLabelText('Host crown'); // sits on Alice's card
    const bobCard = container.querySelector('[data-user-id="user-bob"]');
    document.elementFromPoint = vi.fn(() => bobCard);
    fireEvent.pointerDown(crown, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 200, clientY: 300 });
    fireEvent.pointerUp(window);
    expect(fakeSocket.emit).toHaveBeenCalledWith('transfer_host', {
      roomCode: 'ROOMCODE1',
      targetUserId: 'user-bob',
    });
  });

  it('keeps remaining players\' card colors when someone is removed', async () => {
    const { container } = renderRoom();
    const cardColor = (id) => {
      const card = container.querySelector(`[data-user-id="${id}"]`);
      for (const d of card.querySelectorAll('div')) {
        if (d.style.background) return d.style.background;
      }
      return null;
    };
    const room = baseRoom();
    room.users['user-carol'] = { name: 'Carol', isHost: false, point: null, hasVoted: false, connected: true };
    await act(async () => serverEmits('room_update', room));
    const carolBefore = cardColor('user-carol');
    expect(carolBefore).toBeTruthy();
    // Bob (earlier in the roster) is removed — Carol's color must not shift.
    const withoutBob = { ...room, users: { ...room.users } };
    delete withoutBob.users['user-bob'];
    await act(async () => serverEmits('room_update', withoutBob));
    expect(cardColor('user-carol')).toBe(carolBefore);
  });

  it('plays the boot animation for kicked users and poof for normal leavers', async () => {
    renderRoom();
    const room = baseRoom();
    room.users['user-carol'] = { name: 'Carol', isHost: false, point: null, hasVoted: false, connected: true };
    await act(async () => serverEmits('room_update', room));
    // Bob is kicked: the server flags the departure, then removes him.
    await act(async () => serverEmits('user_kicked', { roomCode: 'ROOMCODE1', userId: 'user-bob', name: 'Bob' }));
    const withoutBob = { ...room, users: { ...room.users } };
    delete withoutBob.users['user-bob'];
    await act(async () => serverEmits('room_update', withoutBob));
    expect(screen.getByText('BOOTED!')).toBeInTheDocument();
    expect(screen.queryByText('POOF!')).not.toBeInTheDocument();
    // Carol leaves normally → regular poof.
    const withoutCarol = { ...withoutBob, users: { ...withoutBob.users } };
    delete withoutCarol.users['user-carol'];
    await act(async () => serverEmits('room_update', withoutCarol));
    expect(screen.getByText('POOF!')).toBeInTheDocument();
  });

  it('does not transfer when the crown is dropped back on the host', async () => {
    const { container } = renderRoom();
    await act(async () => serverEmits('room_update', baseRoom()));
    const crown = screen.getByLabelText('Host crown');
    const aliceCard = container.querySelector('[data-user-id="user-alice"]');
    document.elementFromPoint = vi.fn(() => aliceCard);
    fireEvent.pointerDown(crown, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 200, clientY: 300 });
    fireEvent.pointerUp(window);
    expect(fakeSocket.emit).not.toHaveBeenCalledWith('transfer_host', expect.anything());
  });

  it('marks disconnected users as offline', async () => {
    renderRoom();
    const room = baseRoom();
    room.users['user-bob'].connected = false;
    await act(async () => serverEmits('room_update', room));
    expect(screen.getByText('OFFLINE')).toBeInTheDocument();
  });

  it('emits leave_room on unmount', async () => {
    const { unmount } = renderRoom();
    await act(async () => serverEmits('room_update', baseRoom()));
    fakeSocket.emit.mockClear();
    unmount();
    expect(fakeSocket.emit).toHaveBeenCalledWith('leave_room', { roomCode: 'ROOMCODE1' });
  });

  it('redirects to the join page when no name is given', async () => {
    renderRoom('/room/ROOMCODE1');
    expect(await screen.findByText('JOIN PAGE')).toBeInTheDocument();
  });
});
