import { isUserInRoom } from './Room';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('isUserInRoom', () => {
  it('returns true if user is in room', () => {
    const userId = 'abc123';
    const room = { users: { abc123: { name: 'Alice' } } };
    expect(isUserInRoom(userId, room)).toBe(true);
  });
  it('returns false if user is not in room', () => {
    const userId = 'abc123';
    const room = { users: { def456: { name: 'Bob' } } };
    expect(isUserInRoom(userId, room)).toBe(false);
  });
  it('returns false if room is empty', () => {
    const userId = 'abc123';
    const room = { users: {} };
    expect(isUserInRoom(userId, room)).toBe(false);
  });
  it('returns false if room is null', () => {
    const userId = 'abc123';
    const room = null;
    expect(isUserInRoom(userId, room)).toBe(false);
  });
});

// Example Room render test
// import Room from './Room';
// it('renders Room without crashing', () => {
//   render(
//     <MemoryRouter>
//       <Room user={{ name: 'Test', roomCode: 'ROOM', userId: 'abc123' }} room={{ users: { abc123: { name: 'Test' } } }} socket={{ on: () => {}, emit: () => {} }} />
//     </MemoryRouter>
//   );
// }); 