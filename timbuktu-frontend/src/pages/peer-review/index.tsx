import React from 'react';
import { Container } from '@chakra-ui/react';
import PeerReviewDashboard from '@/components/PeerReview/PeerReviewDashboard';

const PeerReviewPage: React.FC = () => {
  return (
    <Container maxW="7xl" py={8}>
      <PeerReviewDashboard />
    </Container>
  );
};

export default PeerReviewPage;
