import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import AdvancedPeerReviewInterface from '@/components/PeerReview/AdvancedPeerReviewInterface';

const PeerReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const { reviewId } = router.query;

  if (!reviewId || typeof reviewId !== 'string') {
    return (
      <Container maxW="7xl" py={8}>
        <Box>Loading...</Box>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <Box>
        <AdvancedPeerReviewInterface reviewId={parseInt(reviewId)} />
      </Box>
    </Container>
  );
};

export default PeerReviewDetailPage;
