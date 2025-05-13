import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeModal from './DarkModeModal.jsx';

describe('DarkModeModal', () => {
  it('opens the modal when the icon button is clicked', () => {
    render(<DarkModeModal />);
    const button = screen.getByLabelText(/color mode/i);
    fireEvent.click(button);
    expect(screen.getByText(/color mode/i)).toBeInTheDocument();
  });

  it('shows ...really? after three toggle attempts', () => {
    render(<DarkModeModal />);
    const button = screen.getByLabelText(/color mode/i);
    fireEvent.click(button);
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(screen.getByText(/really/i)).toBeInTheDocument();
  });
}); 