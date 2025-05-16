import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayerCard from './';

describe('PlayerCard', () => {
  it('shows the player name by default', () => {
    render(<PlayerCard name="Alice" isHost={false} hasVoted={false} allLocked={false} color="#00e0ff" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows LOCKED IN when voted but not all locked', () => {
    render(<PlayerCard name="Alice" isHost={false} hasVoted={true} allLocked={false} color="#00e0ff" />);
    expect(screen.getByText('LOCKED IN')).toBeInTheDocument();
  });

  it('shows the point when all are locked', () => {
    render(<PlayerCard name="Alice" isHost={false} hasVoted={true} allLocked={true} color="#00e0ff" point={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
}); 