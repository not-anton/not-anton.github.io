import { Box, Text, IconButton, Tooltip } from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function PlayerCard({ name, isHost, hasVoted, allLocked, color, point, showTransfer, onTransfer, socketId }) {
  // Card flip logic:
  // - If user has voted and not allLocked: flip to show 'LOCKED IN'
  // - If allLocked: flip back to show name and point
  const showLocked = hasVoted && !allLocked;
  const showPoint = allLocked && typeof point !== 'undefined' && point !== null;
  // Animation state for pop
  const [pop, setPop] = useState(false);
  useEffect(() => {
    if (showLocked || showPoint) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [showLocked, showPoint]);
  return (
    <>
      <Box
        w="140px"
        h="180px"
        bg={color}
        border="5px solid #fff"
        borderRadius="2xl"
        boxShadow="0 4px 16px #0004"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        fontFamily="'Luckiest Guy', 'Bangers', cursive"
        fontWeight="bold"
        fontSize="xl"
        color="#181825"
        position="relative"
        style={{
          perspective: '600px',
          transition: 'box-shadow 0.3s, border-color 0.3s',
          boxShadow: showLocked ? '0 0 24px 6px #ffe600, 0 4px 16px #0004' : '0 4px 16px #0004',
          borderColor: showLocked ? '#ffe600' : '#fff',
        }}
      >
        {/* Host crown icon in top-right corner if host */}
        {isHost && (
          <Box
            position="absolute"
            top={-30}
            left="50%"
            transform="translateX(-50%)"
            zIndex={3}
            bg="transparent"
          >
            <FaCrown
              style={{
                fontSize: '2.7em',
                color: '#ffe600',
                textShadow: '2px 2px 0 #fff, 0 0 6px #181825',
                filter: 'drop-shadow(0 2px 4px #0008)',
                transform: pop ? 'scale(1.18) rotate(-8deg)' : 'rotate(-8deg)',
                transition: 'transform 0.25s cubic-bezier(.5,1.8,.5,1)'
              }}
              title="Host"
              aria-label="Host crown"
            />
          </Box>
        )}
        {/* Transfer host button (for host, on other users) */}
        {showTransfer && (
          <Tooltip label="Make host" hasArrow>
            <IconButton
              icon={<FaCrown />}
              aria-label="Transfer host"
              size="xs"
              colorScheme="yellow"
              position="absolute"
              top={2}
              left={2}
              borderRadius="full"
              onClick={() => onTransfer(socketId)}
              zIndex={3}
            />
          </Tooltip>
        )}
        {/* Card flip sides */}
        <Box
          w="100%"
          h="100%"
          position="relative"
          style={{
            perspective: '600px',
          }}
        >
          {/* Front side */}
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            style={{
              backfaceVisibility: 'hidden',
              transition: 'transform 0.6s cubic-bezier(.5,1.8,.5,1)',
              transform: showLocked ? 'rotateY(180deg)' : 'rotateY(0deg)',
              zIndex: showLocked ? 1 : 2,
            }}
          >
            <Text fontFamily="inherit" fontWeight="bold" fontSize="2xl" color="#181825" textAlign="center" px={2}>
              {name}
            </Text>
            {showPoint && (
              <Text mt={2} fontFamily="inherit" fontWeight="bold" fontSize="3xl" color="#181825" textAlign="center">
                {point}
              </Text>
            )}
          </Box>
          {/* Back side (LOCKED IN) */}
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            style={{
              backfaceVisibility: 'hidden',
              transition: 'transform 0.6s cubic-bezier(.5,1.8,.5,1)',
              transform: showLocked ? 'rotateY(0deg)' : 'rotateY(180deg)',
              zIndex: showLocked ? 2 : 1,
            }}
          >
            <Text fontFamily="inherit" fontWeight="bold" fontSize="2xl" color="#fff" textAlign="center" px={2} mb={2}>
              {name}
            </Text>
            <Box
              color="#fff"
              fontFamily="inherit"
              fontWeight="bold"
              fontSize="xl"
              bg="#181825"
              px={3}
              py={1}
              borderRadius="xl"
              border="2px solid #fff"
              boxShadow="0 2px 8px #0004"
              zIndex={3}
              style={{
                transition: 'opacity 0.3s',
                opacity: 1,
                animation: pop ? 'markerPop 0.18s cubic-bezier(.68,-0.55,.27,1.55)' : undefined,
              }}
            >
              LOCKED IN
            </Box>
          </Box>
        </Box>
      </Box>
      <style>{`
        @keyframes markerPop {
          0% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.13) rotate(-1deg); }
          60% { transform: scale(0.98) rotate(0.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </>
  );
} 