import React, { useState } from 'react';
import { Box, Heading, Input, Button, VStack, Text } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import ComicBackground from '../../components/ComicBackground';

export default function JoinRoomPage() {
  const { roomCode } = useParams();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    navigate(`/room/${roomCode}?name=${encodeURIComponent(name)}`);
  }

  return (
    <Box height="100vh" overflow="hidden" position="relative" w="100vw" bg="#a259f7">
      <ComicBackground style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
      <Box
        maxW="400px"
        mx="auto"
        mt={{ base: '120px', md: '140px' }}
        p={{ base: 2, md: 4, lg: 8 }}
        borderRadius="2xl"
        border="6px solid #fff"
        bg="#181825"
        boxShadow="0 8px 32px #0008"
        fontFamily="'Luckiest Guy', 'Bangers', cursive'"
        color="#fff"
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        <Heading mb={6} size="lg" color="#00e0ff" fontFamily="inherit" letterSpacing="tight" fontSize={{ base: "xl", md: "2xl" }}>
          Join Room
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              fontFamily="inherit"
              fontWeight="bold"
              fontSize={{ base: "md", md: "lg" }}
              bg="#181825"
              color="#fff"
              border="4px solid #fff"
              borderRadius={16}
              _placeholder={{ color: '#a259f7', fontFamily: 'inherit' }}
              _focus={{ borderColor: '#ffe600', boxShadow: '0 0 0 2px #ffe600' }}
              height="56px"
              px={4}
            />
            <Button
              colorScheme="cyan"
              type="submit"
              size="lg"
              w="100%"
              fontFamily="inherit"
              fontWeight="bold"
              border="4px solid #fff"
              borderRadius={16}
              bg="#00e0ff"
              color="#181825"
              _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
              boxShadow="0 2px 8px #0004"
              height="56px"
            >
              Join Room
            </Button>
            {error && <Text color="#ff2e63" fontSize="md" fontFamily="inherit">{error}</Text>}
          </VStack>
        </form>
      </Box>
    </Box>
  );
} 