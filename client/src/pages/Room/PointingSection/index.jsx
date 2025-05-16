import React from 'react';
import { Box, HStack, Heading, Text, Button } from '@chakra-ui/react';
import PlayerCard from '../../../components/PlayerCard';

const FIBONACCI = [1, 2, 3, 5, 8];

export default function PointingSection({ room, hasVoted, myPoint, handlePoint, pop }) {
  if (!room?.pointingActive) return null;
  return (
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
  );
} 