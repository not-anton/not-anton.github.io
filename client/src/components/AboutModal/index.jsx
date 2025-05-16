import React from 'react';
import { IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Box, Text } from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';

export default function AboutModal({ buttonProps = {} }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        aria-label="About Point-Less"
        icon={<FaInfoCircle />}
        onClick={onOpen}
        bg="transparent"
        color="#ffe600"
        border="none"
        _hover={{ color: '#ff2e63', bg: 'transparent' }}
        fontSize="1.7em"
        {...buttonProps}
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg="#181825"
          border="6px solid #fff"
          borderRadius="2xl"
          boxShadow="0 8px 32px #0008"
          fontFamily="'Luckiest Guy', 'Bangers', cursive"
          maxW="340px"
          p={0}
          style={{ animation: 'pop 0.3s cubic-bezier(.5,1.8,.5,1)'}}
        >
          <ModalHeader textAlign="center" color="#ffe600" fontSize="2xl" fontFamily="inherit" borderBottom="4px solid #fff" py={4}>
            About Point-Less
          </ModalHeader>
          <ModalCloseButton color="#fff" top={2} right={2} fontSize="lg" _hover={{ color: '#ff2e63' }} />
          <ModalBody px={8} py={8}>
            <Box w="100%" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
              <Text fontFamily="inherit" fontWeight="bold" color="#00e0ff" fontSize="xl" mb={2}>
                The most pointless way to point stories!
              </Text>
              <Text fontFamily="inherit" color="#fff" fontSize="md" textAlign="center" mb={4}>
                Point-Less is a playful, comic-inspired story-pointing app for agile teams. Join a room, paste your story, and point with friends—no stress, just fun! 
              </Text>
              <Text fontFamily="inherit" color="#a259f7" fontSize="md" textAlign="center">
                Made for teams who want to point less, and play more.
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
} 