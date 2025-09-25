import React from 'react';
import { Container, Box, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PeerReviewInterface from '../../../components/Moderation/PeerReviewInterface';

const PeerReviewPage: React.FC = () => {
  const router = useRouter();
  const { revisionId } = router.query;

  if (!revisionId || typeof revisionId !== 'string') {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Invalid Revision ID
          </Heading>
          <Text color="gray.600" mb={6}>
            The revision ID provided is invalid.
          </Text>
          <Link href="/moderation">
            <Button colorScheme="blue">
              Back to Moderation
            </Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Peer Review
          </Heading>
          <Text color="gray.600">
            Review revision #{revisionId}
          </Text>
        </Box>
        <Link href="/moderation">
          <Button variant="outline">
            Back to Moderation
          </Button>
        </Link>
      </HStack>
      
      <PeerReviewInterface 
        revisionId={parseInt(revisionId)} 
        onReviewSubmitted={() => {
          // Optionally redirect or show success message
          console.log('Review submitted successfully');
        }}
      />
    </Container>
  );
};

export default PeerReviewPage;
