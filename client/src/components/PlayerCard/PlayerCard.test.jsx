import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PlayerCard from './';

describe('PlayerCard', () => {
  it('shows the player name by default', () => {
    render(<PlayerCard name="Alice" isHost={false} hasVoted={false} revealed={false} color="#00e0ff" />);
    // The name is rendered on both card faces (front and back of the flip).
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
  });

  it('shows LOCKED IN when voted but not revealed', () => {
    render(<PlayerCard name="Alice" isHost={false} hasVoted={true} revealed={false} color="#00e0ff" />);
    expect(screen.getByText('LOCKED IN')).toBeInTheDocument();
  });

  it('shows the point once revealed', () => {
    render(<PlayerCard name="Alice" isHost={false} hasVoted={true} revealed={true} color="#00e0ff" point={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('LOCKED IN')).not.toBeInTheDocument();
  });

  it('shows no point for a user who never voted, even when revealed', () => {
    render(<PlayerCard name="Late" isHost={false} hasVoted={false} revealed={true} color="#00e0ff" point={null} />);
    expect(screen.getAllByText('Late').length).toBeGreaterThan(0);
    expect(screen.queryByText('LOCKED IN')).not.toBeInTheDocument();
  });

  it('shows a grabbable crown on the host card and fires onCrownGrab', () => {
    const onCrownGrab = vi.fn();
    render(
      <PlayerCard name="Alice" isHost={true} hasVoted={false} revealed={false} color="#00e0ff" userId="user-alice" onCrownGrab={onCrownGrab} />
    );
    fireEvent.pointerDown(screen.getByLabelText('Host crown'));
    expect(onCrownGrab).toHaveBeenCalled();
  });

  it('hides the crown while it is being dragged', () => {
    render(
      <PlayerCard name="Alice" isHost={true} hasVoted={false} revealed={false} color="#00e0ff" userId="user-alice" crownHidden />
    );
    expect(screen.queryByLabelText('Host crown')).not.toBeInTheDocument();
  });

  it('tags the card with its userId so drags can find it', () => {
    const { container } = render(
      <PlayerCard name="Bob" isHost={false} hasVoted={false} revealed={false} color="#00e0ff" userId="user-bob" />
    );
    expect(container.querySelector('[data-user-id="user-bob"]')).not.toBeNull();
  });

  it('shows an OFFLINE badge when the user is disconnected', () => {
    render(<PlayerCard name="Bob" isHost={false} hasVoted={false} revealed={false} color="#00e0ff" connected={false} />);
    expect(screen.getByText('OFFLINE')).toBeInTheDocument();
  });

  it('plays the BOOTED animation when booted', () => {
    render(<PlayerCard name="Bob" color="#ffe600" booted />);
    expect(screen.getByText('BOOTED!')).toBeInTheDocument();
    expect(screen.getByLabelText('boot')).toBeInTheDocument();
    expect(screen.queryByText('POOF!')).not.toBeInTheDocument();
  });
});
