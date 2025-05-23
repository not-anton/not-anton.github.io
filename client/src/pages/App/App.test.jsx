import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as socketModule from '../../components/socket.js';
import { JoinRoomOnly } from './App.jsx';
import App from './App.jsx';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../../components/socket.js');

// Only mock react-router-dom for the JoinRoomOnly tests
const useParamsMock = vi.fn();
const useLocationMock = vi.fn();
vi.mock('react-router-dom', () => {
  const actual = vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: useParamsMock,
    useLocation: useLocationMock,
    MemoryRouter: actual.MemoryRouter,
    Link: actual.Link,
  };
});

describe('JoinRoomOnly socket singleton', () => {
  it('should only create one socket and set up listeners once', async () => {
    const emitMock = vi.fn();
    const onMock = vi.fn();
    const fakeSocket = { emit: emitMock, on: onMock };
    socketModule.getSocket.mockReturnValue(fakeSocket);
    vi.mock('react-router-dom').useParams.mockReturnValue({ roomCode: 'ROOMCODE' });
    vi.mock('react-router-dom').useLocation.mockReturnValue({ search: '?name=TestUser' });

    await act(async () => {
      render(
        <MemoryRouter>
          <JoinRoomOnly onJoin={() => {}} />
        </MemoryRouter>
      );
    });

    expect(socketModule.getSocket).toHaveBeenCalledTimes(1);
    expect(onMock).toHaveBeenCalledWith('room_update', expect.any(Function));
    expect(emitMock).toHaveBeenCalledWith('join', expect.objectContaining({ name: 'TestUser', roomCode: 'ROOMCODE' }));
  });
});

describe('JoinRoomOnly integration', () => {
  it('should keep user in room after re-render and socket reconnect', async () => {
    let roomUpdateHandler;
    const emitMock = vi.fn();
    const onMock = vi.fn((event, handler) => {
      if (event === 'room_update') roomUpdateHandler = handler;
      if (event === 'connect') onMock.connectHandler = handler;
    });
    const fakeSocket = { emit: emitMock, on: onMock };
    socketModule.getSocket.mockReturnValue(fakeSocket);
    vi.mock('react-router-dom').useParams.mockReturnValue({ roomCode: 'ROOMCODE' });
    vi.mock('react-router-dom').useLocation.mockReturnValue({ search: '?name=TestUser' });

    await act(async () => {
      render(
        <MemoryRouter>
          <JoinRoomOnly onJoin={() => {}} />
        </MemoryRouter>
      );
    });

    // Simulate room_update with user present
    const userId = localStorage.getItem('userId');
    const roomWithUser = { users: { [userId]: { name: 'TestUser', isHost: true } } };
    await act(async () => {
      roomUpdateHandler(roomWithUser);
    });
    // Simulate room_update with user missing (should trigger re-join)
    const roomWithoutUser = { users: {} };
    await act(async () => {
      roomUpdateHandler(roomWithoutUser);
    });
    // Simulate socket reconnect
    await act(async () => {
      if (onMock.connectHandler) onMock.connectHandler();
    });
    // Should have re-emitted join
    expect(emitMock).toHaveBeenCalledWith('join', expect.objectContaining({ name: 'TestUser', roomCode: 'ROOMCODE' }));
  });
});

describe('JoinRoomOnly debounce empty room_update', () => {
  it('should ignore transient empty room_update and not show user as leaving', async () => {
    let roomUpdateHandler;
    const emitMock = vi.fn();
    const onMock = vi.fn((event, handler) => {
      if (event === 'room_update') roomUpdateHandler = handler;
      if (event === 'connect') onMock.connectHandler = handler;
    });
    const fakeSocket = { emit: emitMock, on: onMock };
    socketModule.getSocket.mockReturnValue(fakeSocket);
    vi.mock('react-router-dom').useParams.mockReturnValue({ roomCode: 'ROOMCODE' });
    vi.mock('react-router-dom').useLocation.mockReturnValue({ search: '?name=TestUser' });

    await act(async () => {
      render(
        <MemoryRouter>
          <JoinRoomOnly onJoin={() => {}} />
        </MemoryRouter>
      );
    });

    // Simulate valid room_update
    const userId = localStorage.getItem('userId');
    const roomWithUser = { users: { [userId]: { name: 'TestUser', isHost: true } } };
    await act(async () => {
      roomUpdateHandler(roomWithUser);
    });
    // Simulate empty room_update (should be ignored)
    const roomWithoutUser = { users: {} };
    await act(async () => {
      roomUpdateHandler(roomWithoutUser);
    });
    // Simulate valid room_update again
    await act(async () => {
      roomUpdateHandler(roomWithUser);
    });
    // The error message should not be shown
    expect(screen.queryByText(/You are not in this room/)).not.toBeInTheDocument();
    // The Room component should still be mounted (look for a known element)
    expect(screen.getByText('Room:')).toBeInTheDocument();
  });
}); 