import { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { Box, Heading, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Button, HStack, Input, VStack, Text, Switch, useBreakpointValue, Flex } from '@chakra-ui/react';
import { FaMoon, FaSun, FaDesktop, FaCopy, FaInfoCircle } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation, useMatch, Link } from 'react-router-dom';
import { AnimatePresence as AnimatePresenceFM, motion as motionFM } from 'framer-motion';
import { getSocket } from '../../components/socket.js';
import '../../theme/comic-font.css';
import rough from 'roughjs/bundled/rough.esm.js';
import DarkModeModal from '../../components/DarkModeModal/DarkModeModal.jsx';

const Room = lazy(() => import('../Room/Room.jsx'));
const ComicBackground = lazy(() => import('../../components/ComicBackground/ComicBackground.jsx'));

function ComicCard({ children, accent = 'cyan' }) {
  // Accent can be 'cyan', 'yellow', 'pink', 'purple', 'lime'
  const accentColor = {
    cyan: '#00e0ff',
    yellow: '#ffe600',
    pink: '#ff2e63',
    purple: '#a259f7',
    lime: '#aaff00',
  }[accent] || '#00e0ff';
  return (
    <Box position="relative" display="inline-block" mx="auto" my={0}>
      {/* Comic border SVG */}
      <svg
        width="110%"
        height="110%"
        viewBox="0 0 420 220"
        style={{ position: 'absolute', top: -18, left: -18, zIndex: 0 }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        pointerEvents="none"
        aria-hidden="true"
      >
        <rect x="10" y="10" width="400" height="200" rx="32" stroke="#fff" strokeWidth="10" strokeDasharray="24 12 8 12" />
      </svg>
      {/* Geometric shapes */}
      <svg width="60" height="60" style={{ position: 'absolute', top: -30, left: -30, zIndex: 1 }} aria-hidden="true">
        <circle cx="30" cy="30" r="28" fill={accentColor} stroke="#fff" strokeWidth="6" />
      </svg>
      <svg width="40" height="40" style={{ position: 'absolute', bottom: -20, right: -20, zIndex: 1 }} aria-hidden="true">
        <polygon points="20,0 40,40 0,40" fill="#ff2e63" stroke="#fff" strokeWidth="5" />
      </svg>
      <svg width="50" height="20" style={{ position: 'absolute', top: 10, right: -30, zIndex: 1 }} aria-hidden="true">
        <rect x="0" y="0" width="50" height="20" rx="8" fill="#ffe600" stroke="#fff" strokeWidth="4" />
      </svg>
      <Box position="relative" zIndex={2}>
        {children}
      </Box>
    </Box>
  );
}

const PALETTE = ['#00e0ff', '#ffe600', '#ff2e63', '#a259f7', '#aaff00'];
const SHAPE_TYPES = ['circle', 'triangle', 'diamond', 'rectangle'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateShapes(mainBox = { x: 0.5, y: 0.5, w: 350, h: 340 }, count = 6) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const margin = 32;
  const boxPx = {
    x: screenW / 2 - mainBox.w / 2,
    y: screenH / 2 - mainBox.h / 2,
    w: mainBox.w,
    h: mainBox.h,
  };
  // Title card area (centered at top)
  const titlePad = 24;
  const titleCard = {
    x: screenW / 2 - 175,
    y: 0 + titlePad,
    w: 350,
    h: 80 + titlePad * 2,
  };
  // 1. Pre-generate all shapes (random type, size, rotation)
  let candidates = [];
  for (let i = 0; i < count * 2; ++i) { // generate extra for fallback
    const type = pick(SHAPE_TYPES);
    const color = pick(PALETTE);
    let size = randomBetween(70, 160);
    let rotation = randomBetween(-15, 15);
    candidates.push({ type, color, size, rotation });
  }
  // 2. Sort by size (largest first)
  candidates.sort((a, b) => (b.size || 0) - (a.size || 0));
  // 3. Greedily place shapes
  const placed = [];
  for (const shape of candidates) {
    let placedShape = null;
    for (let attempt = 0; attempt < 30; ++attempt) {
      let size = shape.size;
      let w = shape.type === 'rectangle' ? size : size;
      let h = shape.type === 'rectangle' ? size / 2 : size;
      let x = randomBetween(margin, screenW - margin - w);
      let y = randomBetween(margin, screenH - margin - h);
      // Avoid main box
      const pad = 32;
      if (
        x + w > boxPx.x - pad &&
        x < boxPx.x + boxPx.w + pad &&
        y + h > boxPx.y - pad &&
        y < boxPx.y + boxPx.h + pad
      ) {
        // If not enough below, force one below main box for first shape
        if (placed.length === 0) {
          y = boxPx.y + boxPx.h + 32;
          if (y + h > screenH - margin) y = screenH - margin - h;
        } else {
          continue;
        }
      }
      // Avoid title card
      if (
        x + w > titleCard.x - pad &&
        x < titleCard.x + titleCard.w + pad &&
        y + h > titleCard.y - pad &&
        y < titleCard.y + titleCard.h + pad
      ) {
        continue;
      }
      // Check overlap with already placed shapes
      let overlaps = false;
      for (const s of placed) {
        const sx = s.x, sy = s.y, sw = s.type === 'rectangle' ? s.size : s.size, sh = s.type === 'rectangle' ? s.size / 2 : s.size;
        if (
          x < sx + sw &&
          x + w > sx &&
          y < sy + sh &&
          y + h > sy
        ) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        placedShape = { ...shape, x, y };
        break;
      }
    }
    if (placedShape) {
      placed.push(placedShape);
      if (placed.length >= count) break;
    }
  }
  return placed;
}

// Helper: generate 8-char room code (uppercase letters/numbers)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; ++i) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function Landing() {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
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
    <>
      <Suspense fallback={null}>
        <ComicBackground />
      </Suspense>
      <Box
        maxW="400px"
        mx="auto"
        p={[2, 4, 8]}
        borderRadius="2xl"
        border="8px solid #fff"
        bg="#222"
        boxShadow="0 8px 32px #0008"
        fontFamily="'Luckiest Guy', 'Bangers', cursive'"
        color="#fff"
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        <Heading mb={6} size="lg" color="#ffe600" fontFamily="inherit" letterSpacing="tight" fontSize={["xl", "2xl"]}>
          Welcome to Point-Less
        </Heading>
        <HStack mb={6} spacing={4} justify="center">
          <Button
            onClick={() => setMode('create')}
            colorScheme="yellow"
            fontFamily="inherit"
            fontWeight="bold"
            border="4px solid #fff"
            borderRadius={16}
            bg={mode === 'create' ? '#ffe600' : '#181825'}
            color={mode === 'create' ? '#181825' : '#fff'}
            _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
            boxShadow="0 2px 8px #0004"
            height="56px"
            fontSize={["md", "lg"]}
            flex={1}
          >
            Create Room
          </Button>
          <Button
            onClick={() => setMode('join')}
            colorScheme="cyan"
            fontFamily="inherit"
            fontWeight="bold"
            border="4px solid #fff"
            borderRadius={16}
            bg={mode === 'join' ? '#00e0ff' : '#181825'}
            color={mode === 'join' ? '#181825' : '#fff'}
            _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
            boxShadow="0 2px 8px #0004"
            height="56px"
            fontSize={["md", "lg"]}
            flex={1}
          >
            Join Room
          </Button>
        </HStack>
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
              fontSize={["md", "lg"]}
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
                fontFamily="inherit"
                fontWeight="bold"
                fontSize={["md", "lg"]}
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
              fontFamily="inherit"
              fontWeight="bold"
              border="4px solid #fff"
              borderRadius={16}
              bg={mode === 'create' ? '#ffe600' : '#00e0ff'}
              color="#181825"
              _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
              boxShadow="0 2px 8px #0004"
              height="56px"
              fontSize={["md", "lg"]}
            >
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </Button>
            {error && <Text color="#ff2e63" fontSize="md" fontFamily="inherit">{error}</Text>}
          </VStack>
        </form>
      </Box>
    </>
  );
}

function AboutModal({ buttonProps = {} }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        aria-label="About Point-Less"
        icon={<FaInfoCircle />}
        position="fixed"
        top={4}
        right={4}
        zIndex={1000}
        {...buttonProps}
        onClick={onOpen}
        bg="#222"
        color="#ffe600"
        border="3px solid #fff"
        _hover={{ bg: '#ff2e63', color: '#fff' }}
        fontSize="1.5em"
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="#181825"
          border="6px solid #fff"
          borderRadius="2xl"
          boxShadow="0 8px 32px #0008"
          fontFamily="'Luckiest Guy', 'Bangers', cursive"
          maxW="340px"
          p={0}
          style={{ animation: 'pop 0.3s cubic-bezier(.5,1.8,.5,1)'}}
        >
          <ModalHeader textAlign="center" color="#ffe600" fontSize="2xl" fontFamily="inherit" borderBottom="4px solid #fff" py={4}>
            About Point-Less
          </ModalHeader>
          <ModalCloseButton color="#fff" top={2} right={2} fontSize="lg" _hover={{ color: '#ff2e63' }} />
          <ModalBody px={8} py={8}>
            <Box w="100%" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
              <Text fontFamily="inherit" fontWeight="bold" color="#00e0ff" fontSize="xl" mb={2}>
                The most pointless way to point stories!
              </Text>
              <Text fontFamily="inherit" color="#fff" fontSize="md" textAlign="center" mb={4}>
                Point-Less is a playful, comic-inspired story-pointing app for agile teams. Join a room, paste your story, and point with friends—no stress, just fun! 
              </Text>
              <Text fontFamily="inherit" color="#a259f7" fontSize="md" textAlign="center">
                Made for teams who want to point less, and play more.
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

function AppHeader({ user, roomCode }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin + '/room/' + roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  const darkModeButtonProps = useBreakpointValue({
    base: { display: 'none' },
    md: { position: 'fixed', top: 4, left: 4, zIndex: 1000, 'aria-label': 'Toggle dark mode', title: 'Toggle dark mode', size: 'lg', tabIndex: 0 }
  });
  const infoButtonProps = useBreakpointValue({
    base: { display: 'none' },
    md: { position: 'fixed', top: 4, right: 4, zIndex: 1000, 'aria-label': 'About Point-Less', title: 'About Point-Less', size: 'lg', tabIndex: 0 }
  });
  return (
    <header>
      <Box mb={8} position="relative" px={[2, 0]}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={{ base: 2, md: 0 }}>
          <DarkModeModal buttonProps={darkModeButtonProps} />
          <AboutModal buttonProps={infoButtonProps} />
        </Box>
        <Flex direction={['column', 'row']} align="center" justify="center" gap={[2, 6]}>
          <Heading as="h1" size="xl" color="#ffe600" letterSpacing="tight" fontFamily="inherit" textAlign={["left", "center"]}>
            Point-Less
          </Heading>
          {user && roomCode && (
            <Box
              mt={[2, 0]}
              ml={[0, 6]}
              alignSelf={["flex-start", "center"]}
              display="flex"
              alignItems="center"
              fontFamily="inherit"
              fontWeight="bold"
              fontSize={["md", "lg"]}
              color="#fff"
              bg="#222"
              px={[3, 4]}
              py={[1, 2]}
              borderRadius="xl"
              border="3px solid #fff"
              as="section"
              aria-label="Room code section"
            >
              <span style={{ marginRight: 8, color: '#ffe600' }}>Room:</span>
              <span>{roomCode}</span>
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
      </Box>
    </header>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoomCode, setCurrentRoomCode] = useState(null);
  const location = useLocation();

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

  return (
    <Box minH="100vh" bg="#181825" fontFamily="'Luckiest Guy', 'Bangers', cursive" py={8}>
      <AppHeader user={currentUser} roomCode={currentRoomCode} />
      <AnimatePresenceFM mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motionFM.div
              initial={{ x: '-100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100vw', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
              style={{ minHeight: '80vh' }}
            >
              <Landing />
            </motionFM.div>
          } />
          <Route path="/room/:roomCode" element={
            <motionFM.div
              initial={{ x: '-100vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100vw', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
              style={{ minHeight: '80vh' }}
            >
              <JoinRoomOnly onJoin={handleJoinRoom} />
            </motionFM.div>
          } />
          <Route path="*" element={
            <motionFM.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.4 }}
              style={{ minHeight: '80vh' }}
            >
              <NotFound />
            </motionFM.div>
          } />
        </Routes>
      </AnimatePresenceFM>
      {/* Comic-style footer credit */}
      <Box as="footer" w="100%" mt={8} py={4} textAlign="center" fontFamily="'Luckiest Guy', 'Bangers', cursive'" fontSize="lg" color="#ffe600" bg="transparent" zIndex={10}>
        BAM! ZAP! © 2024 Iuma Estabrooks
      </Box>
    </Box>
  );
}

function JoinRoomOnly({ onJoin }) {
  const { roomCode } = useParams();
  const location = useLocation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);

  // Persistent userId logic
  function getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      if (window.crypto && window.crypto.randomUUID) {
        userId = window.crypto.randomUUID();
      } else {
        userId = Math.random().toString(36).substr(2, 12);
      }
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  // Get name from query string if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryName = params.get('name');
    if (queryName && !joined && !room) {
      setName(queryName);
      handleJoin(null, queryName);
    }
    // eslint-disable-next-line
  }, [location.search, joined, room]);

  function handleJoin(e, overrideName) {
    if (e) e.preventDefault();
    const finalName = overrideName !== undefined ? overrideName : name;
    if (!finalName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    const sock = getSocket();
    setSocket(sock);
    const userId = getOrCreateUserId();
    sock.emit('join', { userId, name: finalName, roomCode });
    sock.on('room_update', (room) => {
      setRoom({ ...room });
    });
    setJoined(true);
    if (onJoin) onJoin({ name: finalName, roomCode });
  }

  const userId = getOrCreateUserId();
  return (
    <AnimatePresenceFM mode="wait">
      {(!joined || !room) && (
        <motionFM.div
          key="join-form"
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-60vw', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.4 }}
          style={{ position: 'absolute', width: '100%' }}
        >
          <Suspense fallback={null}>
            <ComicBackground />
          </Suspense>
          <Box
            maxW="400px"
            mx="auto"
            mt={0}
            p={[2, 4, 8]}
            borderRadius="2xl"
            border="6px solid #fff"
            bg="#a259f7"
            boxShadow="0 8px 32px #0008"
            fontFamily="'Luckiest Guy', 'Bangers', cursive'"
            color="#181825"
            textAlign="center"
            position="relative"
            zIndex={1}
          >
            <Heading mb={6} size="lg" color="#00e0ff" fontFamily="inherit" letterSpacing="tight" fontSize={["xl", "2xl"]}>
              Join Room
            </Heading>
            <form onSubmit={handleJoin}>
              <VStack spacing={4} align="stretch">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  fontFamily="inherit"
                  fontWeight="bold"
                  fontSize={["md", "lg"]}
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
                  fontSize={["md", "lg"]}
                >
                  Join Room
                </Button>
                {error && <Text color="#ff2e63" fontSize="md" fontFamily="inherit">{error}</Text>}
              </VStack>
            </form>
          </Box>
        </motionFM.div>
      )}
      {(joined && room) && (
        <motionFM.div
          key="room"
          initial={{ x: '60vw', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.4 }}
          style={{ position: 'absolute', width: '100%' }}
        >
          <Suspense fallback={<div style={{color:'#fff',textAlign:'center'}}>Loading room...</div>}>
            <Box className="card-purple"><Room user={{ name, roomCode, userId }} room={room} socket={socket} /></Box>
          </Suspense>
        </motionFM.div>
      )}
    </AnimatePresenceFM>
  );
}

function NotFound() {
  return (
    <Box minH="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" fontFamily="'Luckiest Guy', 'Bangers', cursive'" color="#fff">
      <Box fontSize="6xl" mb={2}>
        💥
      </Box>
      <Heading color="#ff2e63" fontSize={["2xl", "3xl"]} mb={2}>
        404: Page Not Found!
      </Heading>
      <Text color="#00e0ff" fontSize="xl" mb={6}>
        Looks like you wandered off the comic panel...
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
        fontSize={["md", "lg"]}
      >
        Back to Home
      </Button>
    </Box>
  );
}

export default App;
