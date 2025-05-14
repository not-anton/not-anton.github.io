import { Box, Text, IconButton, Tooltip } from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function PlayerCard({ name, isHost, hasVoted, allLocked, color, point, showTransfer, onTransfer, socketId, poof }) {
  // Card flip logic:
  // - If user has voted and not allLocked: flip to show 'LOCKED IN'
  // - If allLocked: flip back to show name and point
  const showLocked = hasVoted && !allLocked;
  const showPoint = allLocked && typeof point !== 'undefined' && point !== null;
  // Animation state for pop
  const [pop, setPop] = useState(false);
  const [justMounted, setJustMounted] = useState(false);
  useEffect(() => {
    setJustMounted(true);
    const t = setTimeout(() => setJustMounted(false), 400);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (showLocked || showPoint) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [showLocked, showPoint]);
  if (poof) {
    return (
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
          opacity: 0,
          animation: 'comicPoof 0.7s cubic-bezier(.68,-0.55,.27,1.55) forwards',
          overflow: 'visible',
        }}
      >
        {/* Comic POOF overlay */}
        <span
          className="poof-overlay"
          style={{
            position: 'absolute',
            top: '-38px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            fontFamily: "'Luckiest Guy', 'Bangers', Impact, 'Comic Sans MS', cursive",
            fontWeight: 'bold',
            fontSize: '2.7em',
            color: '#fff',
            textShadow: '0 0 8px #000, 2px 2px 0 #000, -2px -2px 0 #000, 0 2px 0 #000, 2px 0 0 #000',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            animation: 'poofText 0.7s cubic-bezier(.68,-0.55,.27,1.55) forwards',
            filter: 'drop-shadow(0 0 12px #fff8)',
          }}
        >
          POOF!
        </span>
        {/* Smoke puffs */}
        <span className="smokepuff puff1" />
        <span className="smokepuff puff2" />
        <span className="smokepuff puff3" />
        <span className="smokepuff puff4" />
        <span className="smokepuff puff5" />
        <span className="smokepuff puff6" />
        <style>{`
          @keyframes comicPoof {
            0% { opacity: 1; transform: scale(1) rotate(0deg); }
            15% { opacity: 0.9; transform: scale(1.18) rotate(-12deg); }
            35% { opacity: 0.7; transform: scale(1.05) rotate(10deg); }
            55% { opacity: 0.3; transform: scale(0.7) rotate(-16deg); }
            80% { opacity: 0.05; transform: scale(0.4) rotate(20deg); }
            100% { opacity: 0; transform: scale(0.1) rotate(0deg); }
          }
          @keyframes poofText {
            0% { opacity: 0; transform: scale(0.7) translateX(-50%) rotate(-8deg); }
            10% { opacity: 1; transform: scale(1.1) translateX(-50%) rotate(4deg); }
            30% { opacity: 1; transform: scale(1.2) translateX(-50%) rotate(-6deg); }
            60% { opacity: 1; transform: scale(1.1) translateX(-50%) rotate(2deg); }
            80% { opacity: 0.7; transform: scale(0.8) translateX(-50%) rotate(-4deg); }
            100% { opacity: 0; transform: scale(0.4) translateX(-50%) rotate(0deg); }
          }
          .smokepuff {
            position: absolute;
            bottom: 40px;
            left: 50%;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: radial-gradient(circle at 60% 40%, #fff, #eee 60%, #bbb 90%, transparent 100%);
            opacity: 0;
            pointer-events: none;
            filter: drop-shadow(0 0 12px #fff8) drop-shadow(0 0 24px #fff6);
          }
          .puff1 { animation: smokeL 0.7s 0.03s both; }
          .puff2 { animation: smokeR 0.72s 0.06s both; }
          .puff3 { animation: smokeUp 0.75s 0.09s both; }
          .puff4 { animation: smokeDown 0.68s 0.07s both; }
          .puff5 { animation: smokeDiagL 0.74s 0.05s both; }
          .puff6 { animation: smokeDiagR 0.77s 0.08s both; }
          @keyframes smokeL {
            0% { opacity: 0; transform: scale(0.2) translate(0, 0); }
            10% { opacity: 0.9; transform: scale(0.2) translate(0, 5px); }
            100% { opacity: 0; transform: scale(1.7) translate(-60px, -80px); }
          }
          @keyframes smokeR {
            0% { opacity: 0; transform: scale(0.2) translate(0, 0); }
            10% { opacity: 0.9; transform: scale(0.2) translate(0, 5px); }
            100% { opacity: 0; transform: scale(1.5) translate(70px, -60px); }
          }
          @keyframes smokeUp {
            0% { opacity: 0; transform: scale(0.2) translate(0, 0); }
            10% { opacity: 0.8; transform: scale(0.2) translate(0, 5px); }
            100% { opacity: 0; transform: scale(1.8) translate(-10px, -100px); }
          }
          @keyframes smokeDown {
            0% { opacity: 0; transform: scale(0.2) translate(0, 0); }
            10% { opacity: 0.7; transform: scale(0.2) translate(0, 5px); }
            100% { opacity: 0; transform: scale(1.2) translate(0, 40px); }
          }
          @keyframes smokeDiagL {
            0% { opacity: 0; transform: scale(0.2) translate(0, 0); }
            10% { opacity: 0.8; transform: scale(0.2) translate(0, 5px); }
            100% { opacity: 0; transform: scale(1.4) translate(-50px, -40px); }
          }
          @keyframes smokeDiagR {
            0% { opacity: 0; transform: scale(0.2) translate(0, 0); }
            10% { opacity: 0.8; transform: scale(0.2) translate(0, 5px); }
            100% { opacity: 0; transform: scale(1.4) translate(50px, -40px); }
          }
        `}</style>
      </Box>
    );
  }
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
          animation: justMounted ? 'cardPop 0.38s cubic-bezier(.68,-0.55,.27,1.55)' : undefined,
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
        @keyframes cardPop {
          0% { transform: scaleY(0.7) scaleX(1.1); }
          40% { transform: scaleY(1.2) scaleX(0.95); }
          70% { transform: scaleY(0.95) scaleX(1.05); }
          100% { transform: scaleY(1) scaleX(1); }
        }
      `}</style>
    </>
  );
} 