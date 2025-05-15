import React from 'react';
import { Box } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" w="100vw" left={0} mt="auto" py={4} height="64px" textAlign="center" fontFamily="'Luckiest Guy', 'Bangers', cursive'" fontSize="1.3em" color="#fff" bg="#181825" zIndex={2} position="relative" borderTop="6px solid #fff"
      style={{
        backgroundColor: '#181825',
        textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 2px 8px #000',
        letterSpacing: '1.5px',
        fontWeight: 900,
        lineHeight: 1.2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2em',
        flexWrap: 'wrap',
        borderRadius: 0,
        boxShadow: 'none',
        width: '100vw',
        left: 0,
        borderTop: '6px solid #fff',
      }}
    >
      <a href="/privacy.html" style={{ color: '#ffe600', textDecoration: 'underline', marginRight: '1em', fontWeight: 900 }} target="_blank" rel="noopener noreferrer" aria-label="Privacy Policy">Privacy Policy</a>
      <a href="mailto:hello@point-less.work" style={{ color: '#00e0ff', textDecoration: 'underline', marginRight: '1em', fontWeight: 900 }} target="_blank" rel="noopener noreferrer" aria-label="Contact Email">Contact</a>
      <span style={{ color: '#fff', fontWeight: 900 }}>BAM! ZAP! © 2025 Iuma Estabrooks</span>
    </Box>
  );
} 