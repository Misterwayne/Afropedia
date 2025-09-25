import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Badge,
  Divider
} from '@chakra-ui/react';
import axios from 'axios';

interface SimpleReviewFormProps {
  reviewId: number;
  revisionId: number;
  revisionContent: string;
  revisionComment?: string;
  onReviewCompleted: () => void;
}

const SimpleReviewForm: React.FC<SimpleReviewFormProps> = ({
  reviewId,
  revisionId,
  revisionContent,
  revisionComment,
  onReviewCompleted
}) => {
  const [status, setStatus] = useState<'approved' | 'rejected' | 'needs_changes'>('approved');
  const [score, setScore] = useState<number>(4);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post(`http://localhost:8000/moderation/complete-review/${reviewId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status,
          score,
          feedback
        }
      });

      toast({
        title: "Review Completed",
        description: "Your peer review has been submitted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onReviewCompleted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
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
      case 'needs_changes': return 'yellow';
      default: return 'gray';
    }
  };

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
              Revision ID: {revisionId}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {revisionComment && (
              <Text fontSize="sm" fontStyle="italic" color="gray.700">
                Comment: {revisionComment}
              </Text>
            )}
            <Card variant="outline" bg="gray.50">
              <CardBody>
                <Text whiteSpace="pre-wrap" fontSize="sm" maxH="300px" overflowY="auto">
                  {revisionContent}
                </Text>
              </CardBody>
            </Card>
          </VStack>
        </CardBody>
      </Card>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Your Review
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Review Status</FormLabel>
              <Select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="approved">Approve - Ready for publication</option>
                <option value="needs_changes">Needs Changes - Requires revision</option>
                <option value="rejected">Reject - Not suitable for publication</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Quality Score (1-5)</FormLabel>
              <NumberInput
                value={score}
                onChange={(_, value) => setScore(value)}
                min={1}
                max={5}
                step={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.600" mt={1}>
                1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Detailed Feedback</FormLabel>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback about the content quality, accuracy, writing style, etc."
                rows={6}
              />
            </FormControl>

            <Divider />

            <HStack justify="space-between">
              <Badge colorScheme={getStatusColor(status)} variant="subtle" p={2}>
                Status: {status.replace('_', ' ')}
              </Badge>
              <Badge colorScheme="blue" variant="subtle" p={2}>
                Score: {score}/5
              </Badge>
            </HStack>

            <Button
              colorScheme="purple"
              size="lg"
              onClick={handleSubmitReview}
              isLoading={isSubmitting}
              loadingText="Submitting Review..."
            >
              Submit Review
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default SimpleReviewForm;
