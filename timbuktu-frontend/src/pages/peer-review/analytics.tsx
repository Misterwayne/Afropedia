import React from 'react';
import { Box, Container, Button, HStack, Heading } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import PeerReviewAnalytics from '@/components/PeerReview/PeerReviewAnalytics';

const PeerReviewAnalyticsPage: React.FC = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Box>
        {/* Navigation Header */}
        <HStack spacing={4} mb={6}>
          <Link href="/peer-review" passHref>
            <Button leftIcon={<FiArrowLeft />} variant="ghost" size="sm">
              Back to Dashboard
            </Button>
          </Link>
          <Heading as="h1" size="lg" color="african.800">
            Review Analytics
          </Heading>
        </HStack>
        
        <PeerReviewAnalytics />
      </Box>
    </Container>
  );
};

export default PeerReviewAnalyticsPage;
