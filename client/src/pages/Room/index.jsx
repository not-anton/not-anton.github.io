import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Button, Badge, SimpleGrid, Input, IconButton, Tooltip
} from '@chakra-ui/react';
import { FaCopy, FaPaste, FaCrown } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import PlayerCard from '../../components/PlayerCard';
import { motion as Motion, AnimatePresence as AnimatePresenceFM } from 'framer-motion';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/socket.js';
import PointingSection from './PointingSection';

const PALETTE = ['#00e0ff', '#ffe600', '#ff2e63', '#a259f7', '#aaff00'];

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

// Helper: sanitize input (strip HTML tags)
function sanitize(str) {
  return String(str).replace(/<[^>]*>?/gm, '');
}

export default function Room() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const name = params.get('name') || '';
  const userId = useMemo(getOrCreateUserId, []);
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [storyInput, setStoryInput] = useState('');
  const [pop, setPop] = useState(false);
  const [resultsPop, setResultsPop] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [crack, setCrack] = useState(false);
  const [poofedUsers, setPoofedUsers] = useState([]); // [{ id, name, booted, rect, color }]
  const prevUsersRef = useRef({}); // id -> name
  const kickedRef = useRef(new Set()); // userIds whose departure was a kick
  const cardRectsRef = useRef({}); // id -> last on-screen position of the card
  const colorMapRef = useRef({}); // id -> assigned palette color (sticky)
  // Drag state for the crown (host transfer) and the boot (kick):
  // { type: 'crown' | 'boot', x, y, overUserId } while dragging, else null.
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const roomRef = useRef(null);
  const socketRef = useRef(null);

  const isHost = !!room?.users?.[userId]?.isHost;
  const hasVoted = !!room?.users?.[userId]?.hasVoted;
  const myPoint = room?.users?.[userId]?.point;
  const revealed = !!room?.revealed;

  const userColors = useMemo(() => {
    // Sticky color per userId: once assigned, a player keeps their color for
    // the whole session, so nobody's card recolors when someone is kicked,
    // leaves, or joins. New players get the least-used palette color.
    const map = colorMapRef.current;
    const ids = room && room.users ? Object.keys(room.users) : [];
    ids.forEach(id => {
      if (!map[id]) {
        const used = ids.filter(i => map[i]).map(i => map[i]);
        let pick = PALETTE.find(c => !used.includes(c));
        if (!pick) {
          const counts = PALETTE.map(c => [c, used.filter(u => u === c).length]);
          counts.sort((a, b) => a[1] - b[1]);
          pick = counts[0][0];
        }
        map[id] = pick;
      }
    });
    return { ...map };
  }, [room]);

  // Determine if there is a host in the room
  const hasHost = room && room.users && Object.values(room.users).some(u => u.isHost);

  // Redirect to join page if no name
  useEffect(() => {
    if (!name) navigate(`/join/${roomCode}`, { replace: true });
  }, [name, roomCode, navigate]);

  useEffect(() => {
    if (!name) return;
    const sock = getSocket();
    setSocket(sock);
    setConnected(sock.connected);
    const join = () => sock.emit('join', { userId, name, roomCode });
    const handleRoomUpdate = (roomData) => {
      setRoom({ ...roomData });
      setLoading(false);
    };
    // Re-join on every (re)connect so a dropped socket gets the user back
    // into the room — without this, updates stop after any reconnect.
    const handleConnect = () => {
      setConnected(true);
      join();
    };
    const handleDisconnect = () => setConnected(false);
    const handleKicked = (payload) => {
      if (!payload || payload.roomCode === roomCode) navigate('/');
    };
    // Departures flagged here get the boot animation instead of the poof.
    const handleUserKicked = (payload) => {
      if (payload?.userId) kickedRef.current.add(payload.userId);
    };
    sock.on('room_update', handleRoomUpdate);
    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);
    sock.on('kicked', handleKicked);
    sock.on('user_kicked', handleUserKicked);
    if (sock.connected) join();
    return () => {
      sock.off('room_update', handleRoomUpdate);
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
      sock.off('kicked', handleKicked);
      sock.off('user_kicked', handleUserKicked);
      // Leaving the page is a deliberate exit; free the seat immediately.
      sock.emit('leave_room', { roomCode });
    };
  }, [roomCode, name, userId, navigate]);

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
    const prev = prevUsersRef.current;
    const current = {};
    Object.entries(room?.users || {}).forEach(([id, u]) => { current[id] = u.name; });
    const left = Object.keys(prev).filter(id => !(id in current));
    if (left.length > 0) {
      const leftUsers = left.map(id => {
        const booted = kickedRef.current.has(id);
        kickedRef.current.delete(id);
        // Play the exit where the card actually was, not at the grid's end.
        const rect = cardRectsRef.current[id];
        delete cardRectsRef.current[id];
        // The exit card keeps the player's own color.
        const color = colorMapRef.current[id] || '#fff';
        delete colorMapRef.current[id];
        return { id, name: prev[id] || 'User', booted, rect, color };
      });
      setPoofedUsers(p => [...p, ...leftUsers]);
      setTimeout(() => {
        setPoofedUsers(p => p.filter(x => !left.includes(x.id)));
      }, 1100);
    }
    prevUsersRef.current = current;
  }, [room?.users]);

  // After every render of the grid, remember where each card sits so exit
  // animations (poof/boot) can play in place after the user is removed.
  useEffect(() => {
    Object.keys(room?.users || {}).forEach(id => {
      const el = document.querySelector(`[data-user-id="${CSS.escape(id)}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        cardRectsRef.current[id] = { left: r.left, top: r.top };
      }
    });
  }, [room]);

  function handleSetStory(e) {
    e.preventDefault();
    if (storyInput.trim()) {
      socket.emit('set_story', { roomCode, story: sanitize(storyInput) });
      setStoryInput('');
    }
  }

  function handleStartPointing() {
    socket.emit('start_pointing', { roomCode });
  }

  function handlePoint(point) {
    socket.emit('submit_point', { roomCode, point });
  }

  // Keep refs fresh so the drag listeners never act on stale state.
  roomRef.current = room;
  socketRef.current = socket;

  // A drop is valid if the crown lands on a non-host, or the boot lands on
  // anyone but yourself.
  function dragTargetValid(d, targetId, roomState) {
    if (!d || !targetId) return false;
    if (d.type === 'crown') return !roomState?.users?.[targetId]?.isHost;
    if (d.type === 'boot') return targetId !== userId && !!roomState?.users?.[targetId];
    return false;
  }

  function startDrag(type) {
    return (e) => {
      e.preventDefault();
      const d = { type, x: e.clientX, y: e.clientY, overUserId: null };
      dragRef.current = d;
      setDrag(d);
    };
  }

  useEffect(() => {
    if (!drag) return;
    const handleMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el && el.closest ? el.closest('[data-user-id]') : null;
      const overUserId = card ? card.getAttribute('data-user-id') : null;
      const d = { ...dragRef.current, x: e.clientX, y: e.clientY, overUserId };
      dragRef.current = d;
      setDrag(d);
    };
    const handleUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      const roomState = roomRef.current;
      const sock = socketRef.current;
      if (!d || !sock || !dragTargetValid(d, d.overUserId, roomState)) return;
      if (d.type === 'crown') {
        sock.emit('transfer_host', { roomCode, targetUserId: d.overUserId });
      } else {
        sock.emit('kick_user', { roomCode, targetUserId: d.overUserId });
      }
    };
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag]);

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
    } catch {
      // Optionally show an error or fallback
    }
  }

  if (!name) return null;

  if (loading || !room) {
    return (
      <Box w="100vw" h="100vh" display="flex" flexDirection="column" gap={4} alignItems="center" justifyContent="center" fontSize="2xl" color="#ffe600" fontFamily="'Luckiest Guy', 'Bangers', cursive">
        Loading room...
        {!connected && (
          <Text fontSize="lg" color="#fff">
            <span role="img" aria-label="zap">⚡</span> Connecting to server…
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box maxW={{ base: "98vw", lg: "1200px" }} w="100%" mx="auto" mt={0} p={{ base: 2, md: 4, lg: 8 }} borderRadius="lg" position="relative" flex="1" display="flex" flexDirection="column">
      {/* Connection lost banner */}
      {!connected && (
        <Box
          bg="#ff2e63"
          color="#fff"
          border="4px solid #fff"
          borderRadius={16}
          px={4}
          py={2}
          mb={4}
          textAlign="center"
          fontWeight="bold"
          fontSize="lg"
          role="alert"
        >
          <span role="img" aria-label="zap">⚡</span> Connection lost — reconnecting…
        </Box>
      )}
      {/* Story at top */}
      <Box mb={6} position="relative">
        <HStack justify="space-between" align="center" mb={2}>
          <Heading size="sm" color="#00e0ff">Story</Heading>
          <Tooltip label={copiedInvite ? 'Copied!' : 'Copy invite link'} closeOnClick={false} isOpen={copiedInvite}>
            <Button
              leftIcon={<FaCopy />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/join/' + roomCode);
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
              {roomCode}
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
                  fontFamily="'Luckiest Guy', 'Bangers', cursive"
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
                  fontFamily="'Luckiest Guy', 'Bangers', cursive"
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
        <HStack justify="space-between" align="center" mb={2}>
          <Heading size="sm" color="#aaff00">Participants</Heading>
          {/* The boot: host drags it onto a player to kick them */}
          {isHost && room && Object.keys(room.users).length > 1 && (
            <Box
              as="span"
              role="img"
              aria-label="Kick boot"
              title="Grab the boot and drop it on a player to kick them"
              fontSize="2.4em"
              cursor="grab"
              lineHeight={1}
              onPointerDown={startDrag('boot')}
              style={{
                touchAction: 'none',
                userSelect: 'none',
                opacity: drag?.type === 'boot' ? 0.25 : 1,
                transform: 'rotate(15deg)',
                filter: 'drop-shadow(0 2px 4px #0008)',
                transition: 'opacity 0.15s',
              }}
            >
              🥾
            </Box>
          )}
        </HStack>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4} minChildWidth="140px" w="100%" pt={hasHost ? "2.5em" : undefined}>
          {room && room.users && Object.entries(room.users).map(([id, u]) => (
            <PlayerCard
              key={id}
              name={u.name}
              isHost={u.isHost}
              hasVoted={u.hasVoted}
              revealed={revealed}
              connected={u.connected !== false}
              color={userColors[id]}
              point={u.point}
              userId={id}
              onCrownGrab={startDrag('crown')}
              crownHidden={drag?.type === 'crown'}
              dropTarget={drag && drag.overUserId === id && dragTargetValid(drag, id, room) ? drag.type : null}
              poof={false}
            />
          ))}
        </SimpleGrid>
      </Box>
      {/* Departed users' exit animations, played at the card's last position */}
      {poofedUsers.map(({ id, name: poofName, booted, rect, color }) => createPortal(
        <Box
          key={id + '-exit'}
          position="fixed"
          left={`${rect ? rect.left : 0}px`}
          top={`${rect ? rect.top : 0}px`}
          zIndex={2500}
          pointerEvents="none"
        >
          <PlayerCard
            name={poofName}
            isHost={false}
            hasVoted={false}
            revealed={false}
            connected={true}
            color={color}
            point={null}
            userId={id}
            poof={!booted}
            booted={booted}
          />
        </Box>,
        document.body
      ))}
      {/* Floating crown/boot that follows the cursor while dragging */}
      {drag && createPortal(
        <Box
          position="fixed"
          left={`${drag.x - 26}px`}
          top={`${drag.y - 26}px`}
          zIndex={3000}
          pointerEvents="none"
          style={{
            transition: 'transform 0.1s',
            transform: drag.overUserId && dragTargetValid(drag, drag.overUserId, room)
              ? 'scale(1.3) rotate(-12deg)'
              : 'rotate(-12deg)',
          }}
        >
          {drag.type === 'crown' ? (
            <FaCrown style={{ fontSize: '3em', color: '#ffe600', filter: 'drop-shadow(0 4px 10px #0008)' }} />
          ) : (
            <span style={{ fontSize: '2.8em', filter: 'drop-shadow(0 4px 10px #0008)' }} role="img" aria-label="boot">🥾</span>
          )}
        </Box>,
        document.body
      )}
      <PointingSection
        room={room}
        hasVoted={hasVoted}
        myPoint={myPoint}
        handlePoint={handlePoint}
        pop={pop}
      />
      {/* Results area (slide in when revealed) */}
      <AnimatePresenceFM mode="wait">
        {room?.revealed && (
          <Motion.div
            key="results-area"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
          >
            <Box mt={8} p={4} borderRadius="md" className={`card-yellow${resultsPop ? ' comic-pop' : ''}`} style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 32 }}>
              <Box flex={1} minW={0} position="relative">
                <Heading size="sm" mb={2} color="#181825">Results</Heading>
                {resultsPop && (
                  <Badge className="card-pink" fontSize="1.5em" position="absolute" top={-8} right={-8} zIndex={10} transform="rotate(-12deg)">
                    POW!
                  </Badge>
                )}
                {(() => {
                  const points = Object.values(room.users).map(u => u.point).filter(p => typeof p === 'number');
                  const userIds = room && room.users ? Object.keys(room.users) : [];
                  const lockInTimes = room && room.lockInTimes ? room.lockInTimes : {};
                  const votesCount = points.length;
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
                    const majorities = Object.entries(freq).filter(([, v]) => v === max).map(([k]) => k);
                    majority = majorities.length === 1 ? majorities[0] : majorities.join(', ');
                  }
                  // Fastest Lock-In logic
                  let fastestBadge = null;
                  if (votesCount > 0 && Object.keys(lockInTimes).length > 0) {
                    let fastestId = null;
                    let fastestTime = Infinity;
                    for (const id of userIds) {
                      if (typeof lockInTimes[id] === 'number' && lockInTimes[id] < fastestTime) {
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
                        >
                          <span role="img" aria-label="zap">⚡</span> Fastest Lock-In: <b style={{ marginLeft: 6 }}>{winner}</b>
                        </Badge>
                      );
                    }
                  }
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
                      mb={6}
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
                      >
                        Avg: {avg}
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
                      >
                        Median: {median}
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
                      >
                        Majority: {majority}
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
          </Motion.div>
        )}
      </AnimatePresenceFM>
    </Box>
  );
}
