import { Box, Heading, VStack, HStack, Text, Button, List, ListItem, Badge } from '@chakra-ui/react';

export default function StoryUITest() {
  return (
    <Box maxW="400px" mx="auto" mt={10} p={6} bg="#fff" borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={2}>Story UI Test</Heading>
      <Text mb={4} color="gray.500">This is a test of all Chakra UI components used in the app.</Text>
      <Box mb={4} borderBottom="1px solid #e2e8f0" />
      <VStack spacing={4} align="stretch">
        <Button colorScheme="blue">Blue Button</Button>
        <Button colorScheme="yellow">Yellow Button</Button>
        <HStack>
          <Badge colorScheme="blue">Host</Badge>
          <Badge colorScheme="green">Voted</Badge>
        </HStack>
        <List spacing={1}>
          <ListItem><Text>List Item 1</Text></ListItem>
          <ListItem><Text>List Item 2</Text></ListItem>
        </List>
      </VStack>
    </Box>
  );
} 