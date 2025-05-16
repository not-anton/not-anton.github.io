import React from 'react';
import { Box, Heading, Badge } from '@chakra-ui/react';
import PlayerCard from '../../../components/PlayerCard';

export default function ResultsSection({ room, resultsPop }) {
  if (!room?.revealed) return null;
  return (
    <Box p={4} borderRadius="2xl" bg="#ffe600" color="#181825" border="8px solid red" overflow="visible" style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 32 }}>
      <Box flex={1} minW={0} position="relative">
        <Heading size="sm" mb={2} color="#181825">Results</Heading>
        {/* {resultsPop && (
          <Badge bg="#ff2e63" color="#fff" fontSize="1.5em" position="absolute" top={-8} right={-8} zIndex={10} transform="rotate(-12deg)">
            POW!
          </Badge>
        )} */}
        {/* Results badges and logic moved from RoomContent */}
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
                  bg="#ff2e63"
                  color="#fff"
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
              borderRadius="2xl"
              bg="#fff"
              boxShadow="0 2px 16px #0002"
              p={2}
              my={2}
              mb={4}
            >
              <Badge
                bg="#00e0ff"
                color="#fff"
                fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                px={{ base: 3, sm: 7 }}
                py={{ base: 2, sm: 3 }}
                borderRadius="xl"
                border="4px solid"
                borderColor="#fff"
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
                bg="#ff2e63"
                color="#fff"
                fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                px={{ base: 3, sm: 7 }}
                py={{ base: 2, sm: 3 }}
                borderRadius="xl"
                border="4px solid"
                borderColor="#fff"
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
                bg="#ffe600"
                color="#181825"
                fontSize={{ base: '1em', sm: '1.4em', md: '1.7em' }}
                px={{ base: 3, sm: 7 }}
                py={{ base: 2, sm: 3 }}
                borderRadius="xl"
                border="4px solid"
                borderColor="#fff"
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
  );
} 