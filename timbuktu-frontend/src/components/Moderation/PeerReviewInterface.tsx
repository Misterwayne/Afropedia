import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import axios from 'axios';

interface PeerReview {
  id: number;
  revision_id: number;
  reviewer_id: number;
  status: string;
  score?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface Revision {
  id: number;
  content: string;
  comment?: string;
  timestamp: string;
  user_id?: number;
  user?: {
    username: string;
  };
}

interface PeerReviewInterfaceProps {
  revisionId: number;
  onReviewSubmitted?: () => void;
}

const PeerReviewInterface: React.FC<PeerReviewInterfaceProps> = ({
  revisionId,
  onReviewSubmitted
}) => {
  const [revision, setRevision] = useState<Revision | null>(null);
  const [existingReviews, setExistingReviews] = useState<PeerReview[]>([]);
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [score, setScore] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRevisionAndReviews();
  }, [revisionId]);

  const fetchRevisionAndReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [revisionRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:8000/articles/revisions/${revisionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/moderation/reviews/revision/${revisionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRevision(revisionRes.data);
      setExistingReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching revision and reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load revision data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide feedback for your review",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post('http://localhost:8000/moderation/reviews', {
        revision_id: revisionId,
        reviewer_id: parseInt(localStorage.getItem('userId') || '0'),
        status: reviewStatus,
        score: score,
        feedback: feedback.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Review Submitted",
        description: "Your peer review has been submitted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setReviewStatus('pending');
      setScore(3);
      setFeedback('');
      
      // Refresh data
      fetchRevisionAndReviews();
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'needs_changes': return 'orange';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'green';
    if (score >= 3) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!revision) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Revision Not Found</AlertTitle>
        <AlertDescription>
          The requested revision could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Revision Content */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Revision Content
            </Text>
            <Badge colorScheme="blue">
              ID: {revision.id}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Author: {revision.user?.username || 'Anonymous'} • 
                {new Date(revision.timestamp).toLocaleString()}
              </Text>
              {revision.comment && (
                <Text fontSize="sm" fontStyle="italic" color="gray.700" mb={3}>
                  Comment: {revision.comment}
                </Text>
              )}
            </Box>
            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="gray.50"
              maxH="400px"
              overflowY="auto"
            >
              <Text whiteSpace="pre-wrap" fontSize="sm">
                {revision.content}
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Existing Reviews */}
      {existingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Existing Reviews ({existingReviews.length})
            </Text>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Reviewer</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th>Feedback</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {existingReviews.map((review) => (
                  <Tr key={review.id}>
                    <Td>User {review.reviewer_id}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </Td>
                    <Td>
                      {review.score && (
                        <Badge colorScheme={getScoreColor(review.score)}>
                          {review.score}/5
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="sm" noOfLines={2}>
                        {review.feedback || 'No feedback provided'}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="gray.600">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Review Form */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Submit Peer Review
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Review Status</FormLabel>
              <Select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_changes">Needs Changes</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Quality Score: {score}/5</FormLabel>
              <Slider
                value={score}
                onChange={setScore}
                min={1}
                max={5}
                step={1}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="sm" color="gray.600">Poor (1)</Text>
                <Text fontSize="sm" color="gray.600">Excellent (5)</Text>
              </HStack>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Feedback</FormLabel>
              <Textarea
                placeholder="Provide detailed feedback about this revision..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                resize="vertical"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleSubmitReview}
              isLoading={isSubmitting}
              loadingText="Submitting Review..."
              size="lg"
            >
              Submit Review
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default PeerReviewInterface;
