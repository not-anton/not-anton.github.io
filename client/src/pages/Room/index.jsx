import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Button, List, ListItem, Badge, SimpleGrid, Menu, MenuButton, MenuList, MenuItem, InputGroup, InputLeftElement, Input, IconButton, Tooltip
} from '@chakra-ui/react';
import { FaCopy, FaPaste } from 'react-icons/fa';
import PlayerCard from '../../components/PlayerCard';
import { useCallback } from 'react';
import { motion as motionFM, AnimatePresence as AnimatePresenceFM } from 'framer-motion';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/socket.js';

const FIBONACCI = [1, 2, 3, 5, 8];
const PALETTE = ['#00e0ff', '#ffe600', '#ff2e63', '#a259f7', '#aaff00'];

export default function Room() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const name = params.get('name') || '';
  // Redirect to join page if no name
  if (!name) {
    navigate(`/join/${roomCode}`);
    return null;
  }
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storyInput, setStoryInput] = useState('');
  const [pop, setPop] = useState(false);
  const [resultsPop, setResultsPop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const isHost = room?.users && room.users[user.userId]?.isHost;
  const hasVoted = room?.users && room.users[user.userId]?.hasVoted;
  const myPoint = room?.users && room.users[user.userId]?.point;
  const [startPop, setStartPop] = useState(false);
  const prevPointingActive = useRef(room?.pointingActive);
  const [crack, setCrack] = useState(false);
  const [poofedUsers, setPoofedUsers] = useState([]);
  const prevUsersRef = useRef(Object.keys(room?.users || {}));

  const allLocked = room && Object.values(room.users).every(u => u.hasVoted);
  const userColors = useMemo(() => {
    // Assign a color from the palette to each user, stable by name
    const names = room && room.users ? Object.values(room.users).map(u => u.name) : [];
    const colorMap = {};
    names.forEach((n, i) => {
      colorMap[n] = PALETTE[i % PALETTE.length];
    });
    return colorMap;
  }, [room]);

  // Determine if there is a host in the room
  const hasHost = room && room.users && Object.values(room.users).some(u => u.isHost);

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

  useEffect(() => {
    const userId = getOrCreateUserId();
    const sock = getSocket();
    setSocket(sock);
    sock.emit('join', { userId, name, roomCode });
    const handleRoomUpdate = (roomData) => {
      setRoom({ ...roomData });
      setUser({ userId, name, roomCode });
      setLoading(false);
    };
    sock.on('room_update', handleRoomUpdate);
    return () => {
      sock.off('room_update', handleRoomUpdate);
    };
    // eslint-disable-next-line
  }, [roomCode, name]);

  useEffect(() => {
    if (hasVoted) {
      setPop(true);
      setTimeout(() => setPop(false), 400);
    }
  }, [hasVoted]);

  useEffect(() => {
    if (room?.revealed) {
      setResultsPop(true);
      setTimeout(() => setResultsPop(false), 1500);
    }
  }, [room?.revealed]);

  useEffect(() => {
    const prevUsers = prevUsersRef.current;
    const currentUsers = Object.keys(room?.users || {});
    const leftUsers = prevUsers.filter(id => !currentUsers.includes(id));
    if (leftUsers.length > 0) {
      setPoofedUsers(prev => [...prev, ...leftUsers]);
      setTimeout(() => {
        setPoofedUsers(prev => prev.filter(id => !leftUsers.includes(id)));
      }, 1000);
    }
    prevUsersRef.current = currentUsers;
  }, [room?.users]);

  // Helper: generate 8-char room code (uppercase letters/numbers)
  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; ++i) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // Helper: sanitize input (strip HTML tags)
  function sanitize(str) {
    return String(str).replace(/<[^>]*>?/gm, '');
  }

  function handleSetStory(e) {
    e.preventDefault();
    if (storyInput.trim()) {
      socket.emit('set_story', { roomCode: user.roomCode, story: sanitize(storyInput) });
      setStoryInput('');
    }
  }

  function handleStartPointing() {
    socket.emit('start_pointing', { roomCode: user.roomCode });
  }

  function handlePoint(point) {
    socket.emit('submit_point', { roomCode: user.roomCode, point });
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin + '/room/' + user.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  // Host transfer handler
  function handleTransferHost(targetSocketId) {
    socket.emit('transfer_host', { roomCode: user.roomCode, targetSocketId });
  }

  function handleStartPointingCrack() {
    setCrack(true);
    setTimeout(() => {
      setCrack(false);
      handleStartPointing();
    }, 500); // match animation duration
  }

  // Paste handler for Jira description
  async function handlePasteStory() {
    try {
      const text = await navigator.clipboard.readText();
      setStoryInput(sanitize(text));
    } catch (err) {
      // Optionally show an error or fallback
    }
  }

  if (loading || !room) {
    return (
      <Box w="100vw" h="100vh" display="flex" alignItems="center" justifyContent="center" fontSize="2xl" color="#ffe600" fontFamily="'Luckiest Guy', 'Bangers', cursive'">
        Loading room...
      </Box>
    );
  }

  return (
    <Box maxW={{ base: "98vw", lg: "1200px" }} w="100%" mx="auto" mt={0} p={{ base: 2, md: 4, lg: 8 }} borderRadius="lg" position="relative" flex="1" display="flex" flexDirection="column">
      {/* Story at top */}
      <Box mb={6} position="relative">
        <HStack justify="space-between" align="center" mb={2}>
          <Heading size="sm" color="#00e0ff">Story</Heading>
          <Tooltip label={copiedInvite ? 'Copied!' : 'Copy invite link'} closeOnClick={false} isOpen={copiedInvite}>
            <Button
              leftIcon={<FaCopy />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/join/' + user.roomCode);
                setCopiedInvite(true);
                setTimeout(() => setCopiedInvite(false), 1200);
              }}
              colorScheme="yellow"
              borderRadius={16}
              bg="#ffe600"
              color="#181825"
              border="4px solid #fff"
              _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
              fontSize="1.1em"
              height="40px"
              minW="40px"
              ml={2}
            >
              {user.roomCode}
            </Button>
          </Tooltip>
        </HStack>
        <Box bg="#222" borderRadius="md" p={3} minH="40px" mb={2} fontStyle={!room?.story ? 'italic' : 'normal'} color="#fff" fontSize={{ base: "md", lg: "lg" }}>
          {room?.story || 'No story set'}
        </Box>
        {isHost && (
          <VStack align="stretch" spacing={3} mb={2}>
            <form onSubmit={handleSetStory}>
              <HStack flexDir={{ base: "column", md: "row" }} alignItems="center" spacing={3} w="100%">
                <IconButton
                  aria-label="Paste from clipboard"
                  icon={<FaPaste />}
                  size="lg"
                  colorScheme="yellow"
                  borderRadius={16}
                  onClick={handlePasteStory}
                  bg="#ffe600"
                  color="#181825"
                  border="4px solid #fff"
                  _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
                  fontSize="1.5em"
                  height="56px"
                  minW="56px"
                  p={0}
                  tabIndex={0}
                  boxShadow="none"
                />
                <Input
                  type="text"
                  placeholder="Paste Jira story or description"
                  value={storyInput}
                  onChange={e => setStoryInput(e.target.value)}
                  required
                  fontFamily="'Luckiest Guy', 'Bangers', cursive'"
                  fontWeight="bold"
                  fontSize="lg"
                  bg="#181825"
                  color="#fff"
                  border="4px solid #fff"
                  borderRadius={16}
                  _placeholder={{ color: '#a259f7', fontFamily: 'inherit' }}
                  _focus={{ borderColor: '#ffe600', boxShadow: '0 0 0 2px #ffe600' }}
                  height="56px"
                  minW="260px"
                  px={4}
                  flex={1}
                />
                <Button
                  colorScheme="yellow"
                  type="submit"
                  fontFamily="'Luckiest Guy', 'Bangers', cursive'"
                  w={{ base: "100%", md: "auto" }}
                  bg="#ffe600"
                  color="#181825"
                  border="4px solid #fff"
                  fontWeight="bold"
                  _hover={{ bg: "#ff2e63", color: "#fff", borderColor: "#fff" }}
                  height="56px"
                  minW="140px"
                  borderRadius={16}
                  fontSize="lg"
                >
                  Set Story
                </Button>
              </HStack>
            </form>
            {!room?.pointingActive && (
              <Button
                colorScheme="lime"
                onClick={handleStartPointingCrack}
                bg="#00e0ff"
                color="#181825"
                border="4px solid #fff"
                fontWeight="bold"
                fontFamily="inherit"
                w={{ base: "100%", md: "auto" }}
                height="48px"
                minW="120px"
                className={crack ? 'crack-disappear comic-pop' : ''}
                style={{
                  animation: crack ? 'crackDisappear 0.5s cubic-bezier(.68,-0.55,.27,1.55) forwards' : undefined,
                  pointerEvents: crack ? 'none' : undefined
                }}
                disabled={crack}
              >
                Start Pointing
              </Button>
            )}
          </VStack>
        )}
      </Box>
      <Box mb={4} borderBottom="3px solid #fff" />
      <Box mb={6}>
        <Heading size="sm" mb={2} color="#aaff00">Participants</Heading>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4} minChildWidth="140px" w="100%" pt={hasHost ? "2.5em" : undefined}>
          {room && room.users && Object.entries(room.users).map(([id, u]) => (
            <PlayerCard
              key={id}
              name={u.name}
              isHost={u.isHost}
              hasVoted={u.hasVoted}
              allLocked={allLocked}
              color={userColors[u.name]}
              point={u.point}
              socketId={id}
              showTransfer={isHost && id !== user.userId}
              onTransfer={handleTransferHost}
              poof={false}
            />
          ))}
          {poofedUsers.map(id => (
            <PlayerCard
              key={id + '-poof'}
              name={prevUsersRef.current.find(u => u === id) ? room.users[id]?.name || 'User' : 'User'}
              isHost={false}
              hasVoted={false}
              allLocked={false}
              color={'#fff'}
              point={null}
              socketId={id}
              showTransfer={false}
              onTransfer={() => {}}
              poof={true}
            />
          ))}
        </SimpleGrid>
      </Box>
      {room?.pointingActive && (
        <Box mb={6} className="card-cyan" p={4} borderRadius="lg">
          <HStack justify="space-between" align="center" mb={2}>
            <Heading size="sm" color="#181825" mb={0}>Pointing</Heading>
            <Text color="#181825" fontWeight="bold" fontSize="md" ml={4} whiteSpace="nowrap">
              {Object.values(room.users).filter(u => u.hasVoted).length} / {Object.keys(room.users).length} have voted
            </Text>
          </HStack>
          {hasVoted ? (
            <Text className={pop ? 'comic-pop' : ''} style={{ display: 'inline-block', color: '#181825' }}>
              Your point: <b>{myPoint}</b>
            </Text>
          ) : (
            <Box w="100%">
              <HStack spacing={3} w="100%">
              {FIBONACCI.map(val => (
                <Button
                  key={val}
                  colorScheme="yellow"
                  variant="solid"
                  size="lg"
                  onClick={() => handlePoint(val)}
                  isDisabled={hasVoted}
                  className={pop ? 'comic-pop' : ''}
                    bg="#ffe600"
                    color="#181825"
                    border="4px solid #fff"
                    fontWeight="bold"
                    fontFamily="inherit"
                    borderRadius={16}
                    _hover={{ bg: '#ff2e63', color: '#fff', borderColor: '#fff' }}
                    boxShadow="0 2px 8px #0004"
                    height="56px"
                    flex={1}
                    fontSize="1.5em"
                >
                  {val}
                </Button>
              ))}
            </HStack>
            </Box>
          )}
        </Box>
      )}
      {/* Results area (slide in when revealed) */}
      <AnimatePresenceFM mode="wait">
        {room?.revealed && (
          <motionFM.div
            key="results-area"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
          >
            <Box mt={8} p={4} borderRadius="md" className={`card-yellow${resultsPop ? ' comic-pop' : ''}`} style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 32 }}>
              <Box flex={1} minW={0}>
              <Heading size="sm" mb={2} color="#181825">Results</Heading>
              {resultsPop && (
                <Badge className="card-pink" fontSize="1.5em" position="absolute" top={-8} right={-8} zIndex={10} transform="rotate(-12deg)">
                  POW!
                </Badge>
              )}
                {(() => {
                  const points = Object.values(room.users).map(u => u.point).filter(p => typeof p === 'number');
                  const userIds = room && room.users ? Object.keys(room.users) : [];
                  const allLocked = userIds.length && userIds.every(id => room.users[id].hasVoted);
                  const lockInTimes = room && room.lockInTimes ? room.lockInTimes : {};
                  const showResults = room.revealed;
                  if (!showResults) {
                    return (
                      <Box w="100%" textAlign="center" color="#181825" fontSize="lg" py={6}>
                        <span role="img" aria-label="hourglass">⏳</span> Waiting for all users to lock in...
                      </Box>
                    );
                  }
                  const votesCount = points.length;
                  const totalCount = Object.keys(room.users).length;
                  const avg = votesCount ? (points.reduce((a, b) => a + b, 0) / votesCount).toFixed(2) : 'N/A';
                  // Calculate median
                  let median = 'N/A';
                  if (votesCount) {
                    const sorted = [...points].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    median = sorted.length % 2 !== 0 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
                  }
                  // Calculate majority vote(s)
                  let majority = 'N/A';
                  if (votesCount) {
                    const freq = {};
                    points.forEach(p => { freq[p] = (freq[p] || 0) + 1; });
                    const max = Math.max(...Object.values(freq));
                    const majorities = Object.entries(freq).filter(([_, v]) => v === max).map(([k]) => k);
                    majority = majorities.length === 1 ? majorities[0] : majorities.join(', ');
                  }
                  // Fastest Lock-In logic
                  let fastestBadge = null;
                  if (votesCount > 0 && Object.keys(lockInTimes).length > 0) {
                    let fastestId = null;
                    let fastestTime = Infinity;
                    for (const id of userIds) {
                      if (lockInTimes[id] < fastestTime && typeof lockInTimes[id] === 'number') {
                        fastestTime = lockInTimes[id];
                        fastestId = id;
                      }
                    }
                    const winner = fastestId && room.users[fastestId] ? room.users[fastestId].name : null;
                    if (winner) {
                      fastestBadge = (
                        <Badge
                          className="card-pink"
                          fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                          px={{ base: 3, sm: 7 }}
                          py={{ base: 2, sm: 3 }}
                          borderRadius="xl"
                          border="4px solid #fff"
                          boxShadow="0 2px 8px #0004"
                          minW={0}
                          w={{ base: '100%', sm: 'auto' }}
                          textAlign="center"
                          whiteSpace="normal"
                          wordBreak="break-word"
                          display="flex"
                          alignItems="center"
                          gap={2}
                          style={{ opacity: allLocked ? 1 : 0.5, filter: allLocked ? 'none' : 'grayscale(0.7)' }}
                        >
                          <span role="img" aria-label="zap">⚡</span> Fastest Lock-In: <b style={{ marginLeft: 6 }}>{winner}</b>
                          {!allLocked && <span style={{ marginLeft: 8, fontSize: '0.7em', fontStyle: 'italic' }}>(waiting...)</span>}
                        </Badge>
                      );
                    }
                  }
                  // Style for in-progress results
                  const faded = { opacity: 0.5, filter: 'grayscale(0.7)' };
                  return (
                    <Box
                      mt={4}
                      w="100%"
                      display="flex"
                      flexDirection={{ base: 'column', sm: 'row' }}
                      flexWrap="wrap"
                      alignItems="center"
                      justifyContent="center"
                      gap={{ base: 3, sm: 6 }}
                    >
                      <Badge
                        className="card-cyan"
                        fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                        px={{ base: 3, sm: 7 }}
                        py={{ base: 2, sm: 3 }}
                        borderRadius="xl"
                        border="4px solid #fff"
                        boxShadow="0 2px 8px #0004"
                        minW={0}
                        w={{ base: '100%', sm: 'auto' }}
                        textAlign="center"
                        whiteSpace="normal"
                        wordBreak="break-word"
                        style={allLocked ? {} : faded}
                      >
                        Avg: {avg} {!allLocked && <span style={{ fontSize: '0.7em', fontStyle: 'italic' }}>(partial)</span>}
                      </Badge>
                      <Badge
                        className="card-pink"
                        fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                        px={{ base: 3, sm: 7 }}
                        py={{ base: 2, sm: 3 }}
                        borderRadius="xl"
                        border="4px solid #fff"
                        boxShadow="0 2px 8px #0004"
                        minW={0}
                        w={{ base: '100%', sm: 'auto' }}
                        textAlign="center"
                        whiteSpace="normal"
                        wordBreak="break-word"
                        style={allLocked ? {} : faded}
                      >
                        Median: {median} {!allLocked && <span style={{ fontSize: '0.7em', fontStyle: 'italic' }}>(partial)</span>}
                      </Badge>
                      <Badge
                        className="card-yellow"
                        fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                        px={{ base: 3, sm: 7 }}
                        py={{ base: 2, sm: 3 }}
                        borderRadius="xl"
                        border="4px solid #fff"
                        boxShadow="0 2px 8px #0004"
                        minW={0}
                        w={{ base: '100%', sm: 'auto' }}
                        textAlign="center"
                        whiteSpace="normal"
                        wordBreak="break-word"
                        style={allLocked ? {} : faded}
                      >
                        Majority: {majority} {!allLocked && <span style={{ fontSize: '0.7em', fontStyle: 'italic' }}>(partial)</span>}
                      </Badge>
                      {fastestBadge && (
                        <Box display={{ base: 'flex', sm: 'block' }} justifyContent="center" w={{ base: '100%', sm: 'auto' }}>
                          {fastestBadge}
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          </motionFM.div>
        )}
      </AnimatePresenceFM>
    </Box>
  );
} 

<style>{`
@keyframes comicPop {
  0% { transform: scale(1) rotate(0deg);}
  30% { transform: scale(1.08) rotate(-2deg);}
  60% { transform: scale(0.98) rotate(1deg);}
  100% { transform: scale(1) rotate(0deg);}
}

@keyframes crackDisappear {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  20% { transform: scale(1.05) skewX(-10deg) rotate(-3deg); }
  40% { transform: scale(1.1, 0.95) skewX(10deg) rotate(3deg); }
  60% { transform: scale(0.9, 1.1) skewX(-8deg) rotate(-2deg); opacity: 0.7; }
  80% { transform: scale(0.7, 1.2) skewX(12deg) rotate(6deg); opacity: 0.4; }
  100% { transform: scale(0.2, 0.2) skewX(0deg) rotate(0deg); opacity: 0; }
}
/* Prevent comic-pop animation on hover/focus/active for this button */
.crack-disappear.comic-pop:hover,
.crack-disappear.comic-pop:focus,
.crack-disappear.comic-pop:active,
.comic-pop:hover,
.comic-pop:focus,
.comic-pop:active {
  animation: none !important;
}
`}</style> 