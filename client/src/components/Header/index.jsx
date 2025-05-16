import React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import DarkModeModal from '../DarkModeModal';
import AboutModal from '../AboutModal';

export default function AppHeader() {
  return (
    <header>
      <Box position="relative" px={{ base: 2, md: 0 }}>
        <Flex justify="space-between" align="center" mb={0} px={{ base: 2, md: 4 }} py={2} boxShadow="0 4px 16px #0006" bg="#181825" height="80px" borderRadius={0}>
          {/* Dark mode button on far left */}
          <DarkModeModal buttonProps={{ bg: 'transparent', color: '#fff', border: 'none', _hover: { color: '#ffe600', bg: 'transparent' }, fontSize: '1.7em', minW: '48px', minH: '48px' }} />
          {/* Centered title */}
          <Flex align="center" flex={1} justify="center" minW={0}>
            <Heading as="h1" size="xl" color="#ffe600" letterSpacing="tight" fontFamily="inherit" textAlign="center" flexShrink={0}>
              Point-Less
            </Heading>
          </Flex>
          {/* Info button on far right */}
          <AboutModal buttonProps={{ bg: 'transparent', color: '#ffe600', border: 'none', _hover: { color: '#ff2e63', bg: 'transparent' }, fontSize: '1.7em', minW: '48px', minH: '48px' }} />
        </Flex>
      </Box>
    </header>
  );
} 