import React from 'react';
import { useState, useEffect, Suspense, lazy } from 'react';
import { Box, Heading, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Button, HStack, Input, VStack, Text, Flex } from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import { Routes, Route, useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { AnimatePresence as AnimatePresenceFM, motion as motionFM } from 'framer-motion';
import '../../styles/comic-font.css';
import DarkModeModal from '../../components/DarkModeModal';
import AppHeader from '../../components/Header';
import ComicBackground from '../../components/ComicBackground';
import JoinRoomPage from './JoinRoomPage.jsx';

const Room = lazy(() => import('../Room'));

// Helper: generate 8-char room code (uppercase letters/numbers)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; ++i) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function LandingForm({ mode, setMode, name, setName, roomCode, setRoomCode, error, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
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
        {mode === 'join' && (
          <Input
            type="text"
            placeholder="Room code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            required
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
        )}
        <Button
          colorScheme={mode === 'create' ? 'yellow' : 'cyan'}
          type="submit"
          size="lg"
          w="100%"
          fontWeight="bold"
          border="4px solid #fff"
          borderRadius={16}
          bg={mode === 'create' ? '#ffe600' : '#00e0ff'}
          color="#181825"
          _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
          boxShadow="0 2px 8px #0004"
          height="56px"
        >
          {mode === 'create' ? 'Create Room' : 'Join Room'}
        </Button>
        {error && <Text color="#ff2e63" fontSize="md">{error}</Text>}
      </VStack>
    </form>
  );
}

function Landing() {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || (mode === 'join' && !roomCode.trim())) {
      setError('Please enter your name' + (mode === 'join' ? ' and a room code.' : '.'));
      return;
    }
    setError('');
    if (mode === 'create') {
      const code = generateRoomCode();
      setRoomCode(code);
      navigate(`/room/${code}?name=${encodeURIComponent(name)}`);
    } else {
      navigate(`/room/${roomCode}?name=${encodeURIComponent(name)}`);
    }
  }
  return (
    <Box flex="1" minHeight={0} position="relative" overflow="hidden" width="100%">
      <ComicBackground style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
      <Box
        maxW="400px"
        mx="auto"
        mt={{ base: '120px', md: '140px' }}
        p={{ base: 2, md: 4, lg: 8 }}
        borderRadius="2xl"
        border="8px solid #fff"
        bg="#222"
        boxShadow="0 8px 32px #0008"
        fontFamily="'Luckiest Guy', 'Bangers', cursive'"
        color="#fff"
        textAlign="center"
        zIndex={1}
      >
        <Heading mb={6} size="lg" color="#ffe600" fontFamily="inherit" letterSpacing="tight" fontSize={{ base: "xl", md: "2xl" }}>
          Welcome to Point-Less
        </Heading>
        <HStack mb={6} spacing={4} justify="center">
          {['create', 'join'].map((m) => (
            <Button
              key={m}
              onClick={() => setMode(m)}
              colorScheme={m === 'create' ? 'yellow' : 'cyan'}
              fontWeight="bold"
              border="4px solid #fff"
              borderRadius={16}
              bg={mode === m ? (m === 'create' ? '#ffe600' : '#00e0ff') : '#181825'}
              color={mode === m ? '#181825' : '#fff'}
              _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
              boxShadow="0 2px 8px #0004"
              height="56px"
              fontSize={{ base: "md", md: "lg" }}
              flex={1}
            >
              {m === 'create' ? 'Create Room' : 'Join Room'}
            </Button>
          ))}
        </HStack>
        <LandingForm
          mode={mode}
          setMode={setMode}
          name={name}
          setName={setName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          error={error}
          handleSubmit={handleSubmit}
        />
      </Box>
    </Box>
  );
}

function ComicSuspenseFallback() {
  return (
    <Box w="100vw" h="60vh" display="flex" alignItems="center" justifyContent="center" fontFamily="'Luckiest Guy', 'Bangers', cursive'" fontSize="3xl" color="#ffe600" textShadow="-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 2px 8px #000">
      <span role="img" aria-label="bam">💥</span> BAM! Loading...
    </Box>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  const location = useLocation();
  const params = useParams();

  // If on /room/:roomCode, extract roomCode from params
  const isRoomRoute = location.pathname.startsWith('/room/');
  const roomCode = isRoomRoute ? params.roomCode : null;
  // Pass a dummy user object if in a room to show the copy invite link
  const headerUser = isRoomRoute ? { roomCode } : currentUser;
  const headerRoomCode = isRoomRoute ? roomCode : currentRoomCode;

  useEffect(() => {
    if (location.pathname === "/") {
      setCurrentUser(null);
      setCurrentRoomCode(null);
    }
  }, [location.pathname]);

  function handleJoinRoom({ name, roomCode }) {
    setCurrentUser({ name });
    setCurrentRoomCode(roomCode);
  }

  // Dynamically set background color
  const bgColor = location.pathname === '/' ? '#181825' : '#a259f7';

  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative" fontFamily="'Luckiest Guy', 'Bangers', cursive">
      <AppHeader user={headerUser} roomCode={headerRoomCode} />
      <Box position="relative" zIndex={1} display="flex" flexDirection="column" flex="1 0 auto" minHeight={0}
        bg={location.pathname.startsWith('/room/') ? '#a259f7' : undefined}
      >
        <AnimatePresenceFM mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motionFM.div
                initial={{ x: '-100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100vw', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                <Landing />
              </motionFM.div>
            } />
            <Route path="/join/:roomCode" element={
              <motionFM.div
                initial={{ x: '100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100vw', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <JoinRoomPage />
              </motionFM.div>
            } />
            <Route path="/room/:roomCode" element={
              <motionFM.div
                initial={{ x: '-100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100vw', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Suspense fallback={<ComicSuspenseFallback />}>
                  <Room />
                </Suspense>
              </motionFM.div>
            } />
            <Route path="*" element={
              <motionFM.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.4 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <NotFound />
              </motionFM.div>
            } />
          </Routes>
        </AnimatePresenceFM>
      </Box>
    </Box>
  );
}

function NotFound() {
  return (
    <Box minH="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" fontFamily="'Luckiest Guy', 'Bangers', cursive'" color="#fff" flex="1">
      <Box fontSize="6xl" mb={2}>
        💥
      </Box>
      <Heading color="#ff2e63" fontSize={{ base: "2xl", md: "3xl" }} mb={2}>
        404: Page Not Found!
      </Heading>
      <Text color="#00e0ff" fontSize="xl" mb={6}>
        Looks like you wandered off the friend...
      </Text>
      <Button
        as={Link}
        to="/"
        colorScheme="yellow"
        fontFamily="inherit"
        fontWeight="bold"
        border="4px solid #fff"
        borderRadius={16}
        bg="#ffe600"
        color="#181825"
        _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
        boxShadow="0 2px 8px #0004"
        height="56px"
        fontSize={{ base: "md", md: "lg" }}
      >
        Back to Home
      </Button>
    </Box>
  );
}

export default App;
