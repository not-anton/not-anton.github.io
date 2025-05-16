import React from 'react';
import { Box, Heading, VStack, HStack, Input, IconButton, Button } from '@chakra-ui/react';
import { FaPaste } from 'react-icons/fa';
import PlayerCard from '../../../components/PlayerCard';

export default function StorySection({ user, room, socket, storyInput, setStoryInput, crack, setCrack }) {
  const isHost = room?.users && room.users[user.userId]?.isHost;

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

  async function handlePasteStory() {
    try {
      const text = await navigator.clipboard.readText();
      setStoryInput(sanitize(text));
    } catch (err) {}
  }

  function handleStartPointingCrack() {
    setCrack(true);
    setTimeout(() => {
      setCrack(false);
      socket.emit('start_pointing', { roomCode: user.roomCode });
    }, 500);
  }

  return (
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
  );
} 