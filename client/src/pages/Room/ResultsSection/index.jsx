import React from 'react';
import { Box, Heading, Badge } from '@chakra-ui/react';
import { motion as motionFM, AnimatePresence as AnimatePresenceFM } from 'framer-motion';
import PlayerCard from '../../../components/PlayerCard';

export default function ResultsSection({ room, resultsPop }) {
  if (!room?.revealed) return null;
  return (
    <AnimatePresenceFM mode="wait">
      <motionFM.div
        key="results-area"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, duration: 0.5 }}
      >
        <Box mt={8} p={4} borderRadius="md" bg="#ffe600" color="#181825" style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 32 }}>
          <Box flex={1} minW={0}>
            <Heading size="sm" mb={2} color="#181825">Results</Heading>
            {resultsPop && (
              <Badge bg="#ff2e63" color="#fff" fontSize="1.5em" position="absolute" top={-8} right={-8} zIndex={10} transform="rotate(-12deg)">
                POW!
              </Badge>
            )}
            {/* ...results logic... */}
          </Box>
        </Box>
      </motionFM.div>
    </AnimatePresenceFM>
  );
} 