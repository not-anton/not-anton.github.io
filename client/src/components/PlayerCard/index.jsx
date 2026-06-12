import { Box, Text, Badge } from '@chakra-ui/react';
import { FaCrown } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function PlayerCard({ name, isHost, hasVoted, revealed, color, point, connected = true, userId, poof, booted, onCrownGrab, crownHidden, dropTarget }) {
  // Card flip logic:
  // - If user has voted and points are not revealed yet: show 'LOCKED IN'
  // - Once revealed: flip to show the point
  const showLocked = hasVoted && !revealed;
  const showPoint = revealed && typeof point === 'number';
  // Animation state for pop
  const [pop, setPop] = useState(false);
  const [justMounted, setJustMounted] = useState(false);
  useEffect(() => {
    // Delay the squash-and-stretch animation so fade-in can finish
    const delay = setTimeout(() => {
      setJustMounted(true);
      const t = setTimeout(() => setJustMounted(false), 400);
      return () => clearTimeout(t);
    }, 400); // 400ms delay to match fade-in
    return () => clearTimeout(delay);
  }, []);
  useEffect(() => {
    if (showLocked || showPoint) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [showLocked, showPoint]);
  if (booted) {
    // Kicked: the boot swings in and punts the card off the screen.
    return (
      <Box w="140px" h="180px" position="relative" zIndex={30} style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <Box
          w="100%"
          h="100%"
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
          style={{ animation: 'bootedFly 1s cubic-bezier(.45,-0.2,.8,.6) forwards' }}
        >
          <Text fontFamily="inherit" fontWeight="bold" fontSize="2xl" color="#181825" textAlign="center" px={2}>
            {name}
          </Text>
        </Box>
        {/* The boot that delivers the kick */}
        <span
          role="img"
          aria-label="boot"
          style={{
            position: 'absolute',
            left: '-14px',
            bottom: '-6px',
            fontSize: '3.2em',
            zIndex: 31,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 4px 8px #0008)',
            animation: 'bootSwing 0.9s ease-out forwards',
          }}
        >
          🥾
        </span>
        <span
          style={{
            position: 'absolute',
            top: '-38px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 32,
            fontFamily: "'Luckiest Guy', 'Bangers', Impact, 'Comic Sans MS', cursive",
            fontWeight: 'bold',
            fontSize: '2.2em',
            color: '#fff',
            textShadow: '0 0 8px #000, 2px 2px 0 #000, -2px -2px 0 #000, 0 2px 0 #000, 2px 0 0 #000',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: 'bootedText 1s cubic-bezier(.68,-0.55,.27,1.55) forwards',
            filter: 'drop-shadow(0 0 12px #fff8)',
          }}
        >
          BOOTED!
        </span>
        <style>{`
          @keyframes bootedFly {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            12% { transform: translate(1vw, -3vh) rotate(15deg) skewX(-6deg); opacity: 1; }
            55% { transform: translate(32vw, -22vh) rotate(280deg); opacity: 1; }
            80% { transform: translate(52vw, -16vh) rotate(440deg); opacity: 0.6; }
            100% { transform: translate(68vw, -6vh) rotate(560deg); opacity: 0; }
          }
          @keyframes bootSwing {
            0% { transform: translate(-70px, 70px) rotate(-90deg); opacity: 0; }
            14% { transform: translate(-4px, 14px) rotate(-10deg); opacity: 1; }
            30% { transform: translate(10px, 4px) rotate(18deg); opacity: 1; }
            55% { transform: translate(4px, 10px) rotate(8deg); opacity: 0.8; }
            100% { transform: translate(-10px, 26px) rotate(-12deg); opacity: 0; }
          }
          @keyframes bootedText {
            0% { opacity: 0; transform: scale(0.6) translateX(-50%) rotate(-10deg); }
            12% { opacity: 1; transform: scale(1.25) translateX(-50%) rotate(5deg); }
            35% { opacity: 1; transform: scale(1.1) translateX(-50%) rotate(-4deg); }
            70% { opacity: 1; transform: scale(1) translateX(-50%) rotate(2deg); }
            100% { opacity: 0; transform: scale(0.7) translateX(-50%) rotate(0deg); }
          }
        `}</style>
      </Box>
    );
  }
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
  // The card uses the classic two-faced flip structure: a static outer
  // wrapper (perspective + host/kick controls, which must never rotate —
  // rotating them mirrored the text on flip), an inner rotator with
  // preserve-3d, and two faces with backface-visibility hidden.
  const faceStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--chakra-radii-2xl)',
    border: '5px solid #fff',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    background: color,
  };
  return (
    <Box
      w="140px"
      h="180px"
      position="relative"
      data-user-id={userId}
      tabIndex={0}
      fontFamily="'Luckiest Guy', 'Bangers', cursive"
      fontWeight="bold"
      fontSize="xl"
      color="#181825"
      style={{
        perspective: '1000px',
        opacity: connected ? 1 : 0.45,
        transition: 'opacity 0.3s',
        animation: justMounted ? 'cardPop 0.38s cubic-bezier(.68,-0.55,.27,1.55)' : undefined,
      }}
      _hover={{ zIndex: 10 }}
      _focus={{ zIndex: 10, outline: 'none' }}
    >
      {/* Host crown above the card (static, does not flip). Anyone can grab
          it and drag it onto another player to move the host role. */}
      {isHost && !crownHidden && (
        <Box
          position="absolute"
          top={-30}
          left="50%"
          transform="translateX(-50%)"
          zIndex={3}
          bg="transparent"
          role="img"
          aria-label="Host crown"
          title="Grab the crown and drop it on another player to make them host"
          cursor="grab"
          onPointerDown={onCrownGrab}
          style={{ touchAction: 'none', userSelect: 'none' }}
        >
          <FaCrown
            style={{
              fontSize: '2.7em',
              color: '#ffe600',
              textShadow: '2px 2px 0 #fff, 0 0 6px #181825',
              filter: 'drop-shadow(0 2px 4px #0008)',
              transform: pop ? 'scale(1.18) rotate(-8deg)' : 'rotate(-8deg)',
              transition: 'transform 0.25s cubic-bezier(.5,1.8,.5,1)',
              pointerEvents: 'none',
            }}
          />
        </Box>
      )}
      {/* Drop-target ring while a crown/boot is dragged over this card */}
      {dropTarget && (
        <Box
          position="absolute"
          top="-6px"
          left="-6px"
          right="-6px"
          bottom="-6px"
          borderRadius="2xl"
          border={`6px dashed ${dropTarget === 'crown' ? '#ffe600' : '#ff2e63'}`}
          boxShadow={`0 0 24px 6px ${dropTarget === 'crown' ? '#ffe600aa' : '#ff2e63aa'}`}
          zIndex={4}
          pointerEvents="none"
        />
      )}
      {/* Offline badge */}
      {!connected && (
        <Badge
          position="absolute"
          bottom={2}
          left="50%"
          transform="translateX(-50%)"
          zIndex={3}
          bg="#181825"
          color="#fff"
          borderRadius="md"
          px={2}
          fontSize="0.6em"
        >
          OFFLINE
        </Badge>
      )}
      {/* Rotating card body */}
      <MotionBox
        w="100%"
        h="100%"
        position="relative"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: showLocked ? '0 0 24px 6px #ffe600, 0 4px 16px #0004' : '0 4px 16px #0004',
          borderRadius: 'var(--chakra-radii-2xl)',
          transition: 'box-shadow 0.3s',
        }}
        animate={{ rotateY: showPoint ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front side: name + locked-in state */}
        <Box style={faceStyles}>
          <Text fontFamily="inherit" fontWeight="bold" fontSize="2xl" color="#181825" textAlign="center" px={2}>
            {name}
          </Text>
          {showLocked && (
            <Box mt={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <div className="lock-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Locked"
                >
                  <path
                    d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z"
                    fill="#181825"
                    stroke="#181825"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <Text mt={2} fontFamily="inherit" fontWeight="bold" fontSize="xl" color="#181825" textAlign="center">
                LOCKED IN
              </Text>
            </Box>
          )}
        </Box>
        {/* Back side: name + point (pre-rotated so it reads correctly when flipped) */}
        <Box style={{ ...faceStyles, transform: 'rotateY(180deg)' }}>
          <Text fontFamily="inherit" fontWeight="bold" fontSize="2xl" color="#181825" textAlign="center" px={2}>
            {name}
          </Text>
          {showPoint && (
            <Text mt={2} fontFamily="inherit" fontWeight="bold" fontSize="3xl" color="#181825" textAlign="center">
              {point}
            </Text>
          )}
        </Box>
      </MotionBox>
      <style>{`
        @keyframes cardPop {
          0% { transform: scaleY(0.7) scaleX(1.1); }
          40% { transform: scaleY(1.2) scaleX(0.95); }
          70% { transform: scaleY(0.95) scaleX(1.05); }
          100% { transform: scaleY(1) scaleX(1); }
        }

        .lock-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          animation: lockSettle 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center center;
        }

        @keyframes lockSettle {
          0% {
            transform: scale(0.8) rotate(-15deg);
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          }
          40% {
            transform: scale(1.2) rotate(8deg);
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          }
          70% {
            transform: scale(0.95) rotate(-4deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
          }
          100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }
        }
      `}</style>
    </Box>
  );
}
