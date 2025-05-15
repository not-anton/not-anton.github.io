import React from 'react';
import { useState } from 'react';
import { Box, Flex, Heading, Button } from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';
import DarkModeModal from './DarkModeModal/DarkModeModal.jsx';
import AboutModal from './AboutModal.jsx';

export default function AppHeader({ user, roomCode }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin + '/room/' + roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <header>
      <Box mb={8} position="relative" px={{ base: 2, md: 0 }}>
        <Flex justify="space-between" align="center" mb={{ base: 2, md: 0 }} px={{ base: 2, md: 4 }} py={2} boxShadow="0 4px 16px #0006" bg="#181825" height="96px" borderRadius={0}>
          {/* Dark mode button on far left */}
          <DarkModeModal buttonProps={{ bg: 'transparent', color: '#fff', border: 'none', _hover: { color: '#ffe600', bg: 'transparent' }, fontSize: '1.7em', minW: '48px', minH: '48px' }} />
          {/* Centered title and (if in room) room code/copy box to the right */}
          <Flex align="center" flex={1} justify="center" minW={0}>
            <Heading as="h1" size="xl" color="#ffe600" letterSpacing="tight" fontFamily="inherit" textAlign="center" flexShrink={0}>
              Point-Less
            </Heading>
            {user && roomCode && (
              <Box
                ml={{ base: 2, md: 4 }}
                display="flex"
                alignItems="center"
                fontFamily="inherit"
                fontWeight="bold"
                fontSize={{ base: "md", md: "lg" }}
                color="#fff"
                bg="#222"
                px={{ base: 3, md: 4 }}
                py={{ base: 1, md: 2 }}
                borderRadius="xl"
                border="3px solid #fff"
                as="section"
                aria-label="Room code section"
                minW={0}
                maxW={{ base: "60vw", md: "40vw", lg: "320px" }}
                overflow="hidden"
              >
                <span style={{ marginRight: 8, color: '#ffe600', whiteSpace: 'nowrap' }}>Room:</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{roomCode}</span>
                <Button
                  aria-label={`Copy invite link for room ${roomCode}`}
                  title={`Copy invite link for room ${roomCode}`}
                  onClick={handleCopy}
                  colorScheme="yellow"
                  fontFamily="inherit"
                  fontWeight="bold"
                  border="none"
                  borderRadius="xl"
                  bg="transparent"
                  color="#ffe600"
                  _hover={{ bg: 'transparent', color: '#ff2e63' }}
                  boxShadow="none"
                  size="lg"
                  px={2}
                  ml={2}
                  minW={0}
                  tabIndex={0}
                  _focus={{ boxShadow: '0 0 0 3px #ffe600' }}
                >
                  <FaCopy />
                </Button>
              </Box>
            )}
          </Flex>
          {/* Info button on far right */}
          <AboutModal buttonProps={{ bg: 'transparent', color: '#ffe600', border: 'none', _hover: { color: '#ff2e63', bg: 'transparent' }, fontSize: '1.7em', minW: '48px', minH: '48px' }} />
        </Flex>
      </Box>
    </header>
  );
} 