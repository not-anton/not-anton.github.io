import React from 'react';
import { render, screen } from '@testing-library/react';
import ComicBackground from './';

describe('ComicBackground', () => {
  it('renders SVG shapes', () => {
    render(<ComicBackground />);
    // Should render at least one SVG element
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
}); 