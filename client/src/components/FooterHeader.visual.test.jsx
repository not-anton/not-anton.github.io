import '@testing-library/jest-dom';
import { vi } from 'vitest';
vi.mock('react-icons/fa', () => ({
  FaMoon: () => <span>FaMoon</span>,
  FaInfoCircle: () => <span>FaInfoCircle</span>,
  FaCopy: () => <span>FaCopy</span>,
  FaPaste: () => <span>FaPaste</span>,
}));
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme/theme.js';
import App from '../pages/App/App.jsx';

describe('Header and Footer visual consistency', () => {
  it('should have the same header and footer height on landing and room page', () => {
    window.innerHeight = 800;
    window.dispatchEvent(new Event('resize'));
    // Landing page
    render(
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </ChakraProvider>
    );
    const headerLanding = document.querySelector('header');
    const footerLanding = document.querySelector('footer');
    const headerLandingHeight = headerLanding.getBoundingClientRect().height;
    const footerLandingHeight = footerLanding.getBoundingClientRect().height;
    // Room page
    render(
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={["/room/ABCDEFGH?name=Test"]}>
          <App />
        </MemoryRouter>
      </ChakraProvider>
    );
    const headerRoom = document.querySelector('header');
    const footerRoom = document.querySelector('footer');
    const headerRoomHeight = headerRoom.getBoundingClientRect().height;
    const footerRoomHeight = footerRoom.getBoundingClientRect().height;
    expect(Math.abs(headerLandingHeight - headerRoomHeight)).toBeLessThanOrEqual(2);
    expect(Math.abs(footerLandingHeight - footerRoomHeight)).toBeLessThanOrEqual(2);
  });
}); 