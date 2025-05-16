import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Heading, VStack, HStack, Text, Button, Input, IconButton, SimpleGrid, Badge } from '@chakra-ui/react';
import { FaPaste } from 'react-icons/fa';
import PlayerCard from '../../../components/PlayerCard';
import { motion as motionFM, AnimatePresence as AnimatePresenceFM } from 'framer-motion';
import ResultsSection from './ResultsSection';

const FIBONACCI = [1, 2, 3, 5, 8];
const PALETTE = ['#00e0ff', '#ffe600', '#ff2e63', '#a259f7', '#aaff00'];

export default function RoomContent({ user, room, socket }) {
  const [storyInput, setStoryInput] = useState('');
  const [pop, setPop] = useState(false);
  const [resultsPop, setResultsPop] = useState(false);
  const [crack, setCrack] = useState(false);
  const [poofedUsers, setPoofedUsers] = useState([]);
  const prevUsersRef = useRef(Object.keys(room?.users || {}));
  const isHost = room?.users && room.users[user.userId]?.isHost;
  const hasVoted = room?.users && room.users[user.userId]?.hasVoted;
  const myPoint = room?.users && room.users[user.userId]?.point;
  const allLocked = room && Object.values(room.users).every(u => u.hasVoted);
  const userColors = useMemo(() => {
    const names = room && room.users ? Object.values(room.users).map(u => u.name) : [];
    const colorMap = {};
    names.forEach((n, i) => {
      colorMap[n] = PALETTE[i % PALETTE.length];
    });
    return colorMap;
  }, [room]);

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

  function handleStartPointingCrack() {
    setCrack(true);
    setTimeout(() => {
      setCrack(false);
      socket.emit('start_pointing', { roomCode: user.roomCode });
    }, 500);
  }

  function handlePoint(point) {
    socket.emit('submit_point', { roomCode: user.roomCode, point });
  }

  async function handlePasteStory() {
    try {
      const text = await navigator.clipboard.readText();
      setStoryInput(sanitize(text));
    } catch (err) {}
  }

  function handleTransferHost(targetSocketId) {
    socket.emit('transfer_host', { roomCode: user.roomCode, targetSocketId });
  }

  return (
    <Box flex={1} w="100%" h="100%" display="flex" flexDirection="column" bg="#a259f7">
      {/* Story Section */}
      <Box mb={6}>
        <Heading size="sm" mb={2} color="#00e0ff">Story</Heading>
        <Box bg="#222" borderRadius="md" p={3} minH="40px" mb={2} fontStyle={!room?.story ? 'italic' : 'normal'} color="#fff" fontSize={{ base: "md", lg: "lg" }}>
          {room?.story || 'No story set'}
        </Box>
        {isHost && (
          <VStack align="stretch" spacing={3} mb={2}>
            <form onSubmit={handleSetStory} style={{ width: '100%' }}>
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
      {/* Participants Section */}
      <Box mb={6}>
        <Heading size="sm" mb={2} color="#aaff00">Participants</Heading>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4} minChildWidth="140px" w="100%">
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
      {/* Pointing Section */}
      {room?.pointingActive && (
        <Box mb={6} bg="#00e0ff" p={4} borderRadius="lg">
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
      <ResultsSection room={room} resultsPop={resultsPop} />
    </Box>
  );
} 