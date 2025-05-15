import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme/theme.js';
import App from '../pages/App/App.jsx';
import { describe, it, expect } from 'vitest';

describe('Footer sticky layout', () => {
  it('should always be at the bottom of the viewport on short content', () => {
    window.innerHeight = 800;
    window.dispatchEvent(new Event('resize'));
    render(
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </ChakraProvider>
    );
    const footer = screen.getByText(/BAM! ZAP!/).closest('footer');
    expect(footer).toBeInTheDocument();
    const rect = footer.getBoundingClientRect();
    expect(Math.abs(rect.bottom - window.innerHeight)).toBeLessThanOrEqual(4);
  });

  it('should be below the main content on tall pages', () => {
    window.innerHeight = 400;
    window.dispatchEvent(new Event('resize'));
    render(
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </ChakraProvider>
    );
    const footer = screen.getByText(/BAM! ZAP!/).closest('footer');
    expect(footer).toBeInTheDocument();
    const rect = footer.getBoundingClientRect();
    expect(Math.abs(rect.bottom - window.innerHeight)).toBeLessThanOrEqual(4);
  });
}); 