import React from 'react';
import { IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Box, Text, Link, Divider, Stack, HStack, List, ListItem, ListIcon } from '@chakra-ui/react';
import { FaInfoCircle, FaGithub, FaUser, FaLock } from 'react-icons/fa';

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
          maxW="420px"
          p={0}
          style={{ animation: 'pop 0.3s cubic-bezier(.5,1.8,.5,1)'}}
        >
          <ModalHeader textAlign="center" color="#ffe600" fontSize="2xl" fontFamily="inherit" borderBottom="4px solid #fff" py={4}>
            About Point-Less
          </ModalHeader>
          <ModalCloseButton color="#fff" top={2} right={2} fontSize="lg" _hover={{ color: '#ff2e63' }} />
          <ModalBody px={8} py={6}>
            <Stack spacing={4} align="center" w="100%">
              {/* Made by section */}
              <Box w="100%" textAlign="center">
                <HStack justify="center" spacing={2} mb={1}>
                  <FaUser color="#ffe600" />
                  <Text fontSize="sm" color="#ffe600" fontWeight="bold">
                    Made by <Link href="https://github.com/not-anton" color="#a259f7" isExternal>Iuma Estabrooks</Link> &amp; ChatGPT (AI)
                  </Text>
                </HStack>
              </Box>
              <Divider borderColor="#333" />
              {/* App name and tagline */}
              <Box textAlign="center">
                <Text fontSize="xl" color="#00e0ff" fontWeight="bold" mb={1}>
                  Point-Less
                </Text>
                <Text fontSize="md" color="#fff" fontFamily="inherit" mb={1}>
                  Point less, code more!
                </Text>
                <Text fontSize="sm" color="#a259f7" fontFamily="inherit">
                  Made for teams who want to have a little fun while they point.
                </Text>
              </Box>
              {/* Links */}
              <HStack spacing={4} justify="center" mt={2}>
                <Link href="https://github.com/not-anton/not-anton.github.io" color="#a259f7" isExternal display="flex" alignItems="center">
                  <FaGithub style={{ marginRight: 6 }} /> GitHub
                </Link>
                <Link href="/privacy.html" color="#a259f7" isExternal display="flex" alignItems="center">
                  <FaLock style={{ marginRight: 6 }} /> Privacy Policy
                </Link>
              </HStack>
              <Divider borderColor="#333" />
              {/* Privacy summary */}
              <Box w="100%" textAlign="left">
                <Text fontSize="sm" color="#ffe600" fontWeight="bold" mb={1}>
                  Privacy at a Glance
                </Text>
                <List spacing={1} fontSize="xs" color="#bbb" pl={2}>
                  <ListItem><ListIcon as={FaLock} color="#ffe600" />No personal data collected or stored</ListItem>
                  <ListItem><ListIcon as={FaLock} color="#ffe600" />No tracking or analytics</ListItem>
                  <ListItem><ListIcon as={FaLock} color="#ffe600" />Room data is temporary and private</ListItem>
                </List>
              </Box>
              <Divider borderColor="#333" />
              {/* Copyright */}
              <Text fontSize="xs" color="#888" textAlign="center" mt={2}>
                © {new Date().getFullYear()} Iuma Estabrooks. All rights reserved.
              </Text>
            </Stack>
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