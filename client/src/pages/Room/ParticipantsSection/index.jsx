import React from 'react';
import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import PlayerCard from '../../../components/PlayerCard';

export default function ParticipantsSection({ user, room, userColors, poofedUsers, prevUsersRef, handleTransferHost }) {
  const isHost = room?.users && room.users[user.userId]?.isHost;
  const allLocked = room && Object.values(room.users).every(u => u.hasVoted);

  return (
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
  );
} 