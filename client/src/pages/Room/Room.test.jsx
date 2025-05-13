import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Room from './Room.jsx';

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

describe('Room', () => {
  it('shows the copy badge and room code', () => {
    render(<Room user={{ name: 'Alice', roomCode: 'ABC123' }} room={mockRoom} socket={mockSocket} />);
    expect(screen.getByText('Room:')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByLabelText(/copy invite link/i)).toBeInTheDocument();
  });

  it('shows the story input for the host', () => {
    render(<Room user={{ name: 'Alice', roomCode: 'ABC123' }} room={mockRoom} socket={mockSocket} />);
    expect(screen.getByPlaceholderText(/paste jira story/i)).toBeInTheDocument();
  });

  it('does not show the story input for non-host', () => {
    render(<Room user={{ name: 'Bob', roomCode: 'ABC123' }} room={mockRoom} socket={{ ...mockSocket, id: 'socket2' }} />);
    expect(screen.queryByPlaceholderText(/paste jira story/i)).not.toBeInTheDocument();
  });

  it('shows the Fastest Lock-In award for the correct user', () => {
    const mockRoom = {
      users: {
        'socket1': { name: 'Alice', isHost: true, point: 3, hasVoted: true },
        'socket2': { name: 'Bob', isHost: false, point: 5, hasVoted: true },
        'socket3': { name: 'Carol', isHost: false, point: 2, hasVoted: true },
      },
      story: 'Test story',
      pointingActive: false,
      revealed: true,
    };
    const mockSocket = { id: 'socket1', on: () => {}, emit: () => {} };
    const { rerender } = render(
      <Room user={{ name: 'Alice', roomCode: 'ROOMCODE' }} room={mockRoom} socket={mockSocket} />
    );
    expect(screen.getByText(/Fastest Lock-In/i)).toBeInTheDocument();
    expect(screen.getByText(/Carol/)).toBeInTheDocument();
  });
}); 