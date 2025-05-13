import { useState, useEffect } from 'react';
import { IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Box, Text, Switch } from '@chakra-ui/react';
import { FaMoon } from 'react-icons/fa';

export default function DarkModeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [toggle, setToggle] = useState(true);
  const [tries, setTries] = useState(0);
  function handleToggle() {
    setToggle(false);
    setTries(t => t + 1);
    setTimeout(() => {
      setToggle(true);
    }, 400);
  }
  // Reset tries when modal closes
  useEffect(() => {
    if (!isOpen) setTries(0);
  }, [isOpen]);
  return (
    <>
      <IconButton
        aria-label="Color mode"
        icon={<FaMoon />}
        position="fixed"
        top={4}
        left={4}
        zIndex={1000}
        onClick={onOpen}
        bg="#222"
        color="#fff"
        border="3px solid #fff"
        _hover={{ bg: '#333' }}
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
            Color Mode
          </ModalHeader>
          <ModalCloseButton color="#fff" top={2} right={2} fontSize="lg" _hover={{ color: '#ff2e63' }} />
          <ModalBody px={8} py={8}>
            <Box w="100%" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
              <Box display="flex" alignItems="center" justifyContent="center" w="100%">
                <Text fontFamily="inherit" fontWeight="bold" color="#fff" fontSize="lg" mr={4}>
                  Dark Mode
                </Text>
                <Switch
                  isChecked={toggle}
                  onChange={handleToggle}
                  size="lg"
                  colorScheme="yellow"
                  sx={{
                    '.chakra-switch__track': {
                      bg: '#ffe600',
                      border: '3px solid #fff',
                      h: '32px',
                      w: '64px',
                      transition: 'all 0.2s cubic-bezier(.5,1.8,.5,1)',
                    },
                    '.chakra-switch__thumb': {
                      bg: '#ff2e63',
                      border: '3px solid #fff',
                      boxShadow: '0 2px 8px #0004',
                      w: '28px',
                      h: '28px',
                      transition: 'all 0.18s cubic-bezier(.5,1.8,.5,1)',
                      transform: 'translateX(0px)',
                      animation: !toggle ? 'toggle-pop 0.22s cubic-bezier(.5,1.8,.5,1)' : 'none',
                    },
                    '&[data-checked] .chakra-switch__thumb': {
                      transform: 'translateX(36px)',
                    },
                  }}
                />
              </Box>
              {tries >= 3 && (
                <Text
                  mt={4}
                  color="#ffe600"
                  fontFamily="inherit"
                  fontSize="xl"
                  fontWeight="bold"
                  textAlign="center"
                  letterSpacing=".5px"
                  textShadow="2px 2px #181825"
                  style={{
                    animation: 'really-bounce 0.5s cubic-bezier(.5,1.8,.5,1)',
                    display: 'inline-block',
                  }}
                >
                  ...really?
                </Text>
              )}
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
        @keyframes really-bounce {
          0% { transform: scale(0.7) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes toggle-pop {
          0% { transform: scale(1) translateX(0); }
          60% { transform: scale(1.25) translateX(0); }
          100% { transform: scale(1) translateX(0); }
        }
      `}</style>
    </>
  );
}
