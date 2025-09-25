import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import ModerationDashboard from '../../components/Moderation/ModerationDashboard';

const ModerationPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Content Moderation
        </Heading>
        <Text color="gray.600">
          Manage content moderation, peer reviews, and community guidelines
        </Text>
      </Box>
      
      <ModerationDashboard />
    </Container>
  );
};

export default ModerationPage;
