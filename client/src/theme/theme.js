import { extendTheme } from '@chakra-ui/react';

const comicFonts = `'Luckiest Guy', 'Bangers', cursive`;

const colors = {
  cyan: {
    500: '#00e0ff',
  },
  yellow: {
    500: '#ffe600',
  },
  pink: {
    500: '#ff2e63',
  },
  purple: {
    500: '#a259f7',
  },
  lime: {
    500: '#aaff00',
  },
  black: {
    500: '#181825',
  },
  white: {
    500: '#fff',
  },
};

const theme = extendTheme({
  fonts: {
    heading: comicFonts,
    body: comicFonts,
    mono: comicFonts,
  },
  colors,
  radii: {
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borders: {
    thick: '6px solid #fff',
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default theme; 