// pages/revision/[revisionId].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Flex,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Input,
  Avatar,
  Spacer,
  Icon
} from '@chakra-ui/react';
import { FiExternalLink, FiUser, FiClock, FiMessageSquare, FiCheck, FiX, FiEye, FiSend } from 'react-icons/fi';
import Link from 'next/link';
import apiClient from '@/lib/api';
import RevisionDiff from '@/components/Article/RevisionDiff';
import { Revision } from '@/types';

interface RevisionDetails {
  revision: Revision;
  article: {
    id: number;
    title: string;
    status: string;
  };
  reviews: Array<{
    id: number;
    reviewer: {
      id: number;
      username: string;
      role: string;
    };
    status: string;
    overall_score: number;
    summary: string;
    created_at: string;
  }>;
  moderation_actions: Array<{
    id: number;
    moderator: {
      id: number;
      username: string;
    };
    action_type: string;
    reason: string;
    created_at: string;
  }>;
}

const RevisionDetailPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isActionOpen, onOpen: onActionOpen, onClose: onActionClose } = useDisclosure();
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisionDetails, setRevisionDetails] = useState<RevisionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchRevisionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { revisionId } = router.query;
        if (!revisionId || typeof revisionId !== 'string') {
          setError('Invalid revision ID');
          return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await apiClient.get<RevisionDetails>(`/articles/revisions/${revisionId}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRevisionDetails(response.data);
      } catch (err: any) {
        console.error('Error fetching revision details:', err);
        if (err.response?.status === 404) {
          setError('Revision not found');
        } else if (err.response?.status === 401) {
          setError('Authentication required');
        } else {
          setError(err.response?.data?.message || 'Failed to load revision details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchRevisionDetails();
    }
  }, [router.isReady, router.query]);

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error loading revision</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (!revisionDetails) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No revision data</AlertTitle>
          <AlertDescription>Unable to load revision details.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const { revision, article, reviews, moderation_actions } = revisionDetails;

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem('authToken');
      
      const response = await apiClient.patch(`/articles/${revisionDetails?.article.title}/revisions/${revisionDetails?.revision.id}`, {
        comment: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state with the new comment
      if (revisionDetails) {
        const newCommentObj = {
          id: response.data.comment.id,
          content: newComment,
          user_id: response.data.comment.user_id,
          created_at: response.data.comment.created_at,
          revision_id: revisionDetails.revision.id,
          user: response.data.comment.user
        };

        setRevisionDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            revision: {
              ...prev.revision,
              comments: prev.revision.comments ? [...prev.revision.comments, newCommentObj] : [newCommentObj]
            }
          };
        });
      }

      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit comment.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return past.toLocaleDateString();
  };

  const handleModerationAction = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const endpoint = actionType === 'approve' ? '/moderation/approve' : '/moderation/reject';
      await apiClient.post(endpoint, {
        content_type: 'revision',
        content_id: revision.id,
        reason: actionReason || `${actionType === 'approve' ? 'Approved' : 'Rejected'} by moderator`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Revision ${actionType}d successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onActionClose();
      router.reload(); // Refresh the page to show updated status
    } catch (error: any) {
      console.error(`Error ${actionType}ing revision:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} revision`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (revision: any) => {
    if (revision.is_approved === true) return 'green';
    if (revision.status === 'rejected') return 'red';
    if (revision.status === 'approved') return 'green';
    if (revision.status === 'pending') return 'yellow';
    return 'gray'; // For null or unknown status
  };

  const getStatusText = (revision: any) => {
    if (revision.is_approved === true) return 'Approved';
    if (revision.status === 'rejected') return 'Rejected';
    if (revision.status === 'approved') return 'Approved';
    if (revision.status === 'pending') return 'Pending';
    if (revision.status === null) return 'Unknown';
    return 'Unknown';
  };

  return (
    <Container maxW="7xl" py={8}>
      {/* Header */}
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <Heading size="lg">
                  Revision #{revision.id}
                </Heading>
                <HStack spacing={4}>
                  <Badge colorScheme="blue" variant="outline">
                    <Link href={`/wiki/${article.title}`}>
                      <HStack spacing={1} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        <Text>Article: {article.title.replace(/_/g, ' ')}</Text>
                        <FiExternalLink size={12} />
                      </HStack>
                    </Link>
                  </Badge>
                  <Badge 
                    colorScheme={getStatusColor(revision)}
                    variant="solid"
                  >
                    {getStatusText(revision)}
                  </Badge>
                  {revision.needs_review && (
                    <Badge colorScheme="orange" variant="outline">
                      Needs Review
                    </Badge>
                  )}
                </HStack>
              </VStack>
              <HStack spacing={2}>
                <Button
                  leftIcon={<FiCheck />}
                  colorScheme="green"
                  size="sm"
                  onClick={() => {
                    setActionType('approve');
                    onActionOpen();
                  }}
                  isDisabled={revision.is_approved}
                >
                  Approve
                </Button>
                <Button
                  leftIcon={<FiX />}
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    setActionType('reject');
                    onActionOpen();
                  }}
                  isDisabled={revision.status === 'rejected'}
                >
                  Reject
                </Button>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={6} wrap="wrap">
                <HStack spacing={2}>
                  <FiUser />
                  <Text fontSize="sm" color="gray.600">
                    Author: <Badge colorScheme="blue">{revision.user?.username || 'Anonymous'}</Badge>
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <FiClock />
                  <Text fontSize="sm" color="gray.600">
                    {new Date(revision.timestamp).toLocaleString()}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <FiMessageSquare />
                  <Text fontSize="sm" color="gray.600">
                    {revision.comments?.length || 0} comment{(revision.comments?.length || 0) !== 1 ? 's' : ''}
                  </Text>
                </HStack>
              </HStack>
              
              {revision.comment && (
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Revision Comment:</Text>
                  <Text fontSize="sm">{revision.comment}</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Main Content Tabs */}
        <Tabs>
          <TabList>
            <Tab>Content & Changes</Tab>
            <Tab>Comments ({revision.comments?.length || 0})</Tab>
            <Tab>Peer Reviews ({reviews.length})</Tab>
            <Tab>Moderation History ({moderation_actions.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Content & Changes Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">Revision Content</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      fontFamily="mono"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                      maxH="400px"
                      overflowY="auto"
                    >
                      {revision.content}
                    </Box>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Changes from Previous Version</Heading>
                  </CardHeader>
                  <CardBody>
                    <RevisionDiff 
                      revisionId={revision.id} 
                      articleTitle={article.title} 
                    />
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Comments Tab */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Comments ({revision.comments?.length || 0})</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Add Comment Form */}
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          Add a comment:
                        </Text>
                        <Input
                          placeholder="Share your thoughts on this revision..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          bg="white"
                          borderColor="gray.300"
                          _focus={{ borderColor: "african.500", boxShadow: "0 0 0 1px african.500" }}
                        />
                        <HStack justify="flex-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setNewComment('')}
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="african"
                            leftIcon={<FiSend />}
                            onClick={handleCommentSubmit}
                            isLoading={isSubmittingComment}
                            isDisabled={!newComment.trim()}
                          >
                            Submit
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Comments List */}
                    {revision.comments && revision.comments.length > 0 ? (
                      <VStack spacing={3} align="stretch">
                        {revision.comments.map((comment: any, index: number) => (
                          <Card key={comment.id || index} variant="outline">
                            <CardBody p={4}>
                              <HStack align="start" spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={comment.user?.username || 'Anonymous'}
                                  bg="african.500"
                                  color="white"
                                />
                                <VStack align="start" spacing={2} flex={1}>
                                  <HStack spacing={2} align="center">
                                    <Text fontSize="sm" fontWeight="semibold" color="african.600">
                                      {comment.user?.username || 'Anonymous'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {formatTimeAgo(comment.created_at)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.400">
                                      •
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.700">
                                    {comment.content}
                                  </Text>
                                </VStack>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        <AlertTitle>No comments yet</AlertTitle>
                        <AlertDescription>
                          Be the first to comment on this revision!
                        </AlertDescription>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Peer Reviews Tab */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Peer Reviews</Heading>
                </CardHeader>
                <CardBody>
                  {reviews.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>No reviews yet</AlertTitle>
                      <AlertDescription>This revision hasn't been reviewed by peers yet.</AlertDescription>
                    </Alert>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Reviewer</Th>
                          <Th>Status</Th>
                          <Th>Score</Th>
                          <Th>Summary</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {reviews.map((review) => (
                          <Tr key={review.id}>
                            <Td>
                              <HStack spacing={2}>
                                <FiUser />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {review.reviewer.username}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {review.reviewer.role}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  review.status === 'approved' ? 'green' :
                                  review.status === 'rejected' ? 'red' : 'yellow'
                                }
                              >
                                {review.status}
                              </Badge>
                            </Td>
                            <Td>
                              {review.overall_score ? (
                                <Badge colorScheme="blue">
                                  {review.overall_score}/5
                                </Badge>
                              ) : (
                                <Text fontSize="sm" color="gray.500">-</Text>
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm" noOfLines={2}>
                                {review.summary || 'No summary provided'}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(review.created_at).toLocaleDateString()}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Moderation History Tab */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Moderation History</Heading>
                </CardHeader>
                <CardBody>
                  {moderation_actions.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>No moderation actions</AlertTitle>
                      <AlertDescription>This revision hasn't been moderated yet.</AlertDescription>
                    </Alert>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {moderation_actions.map((action) => (
                        <Box key={action.id} p={3} borderWidth="1px" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <HStack spacing={2}>
                              <Badge 
                                colorScheme={action.action_type === 'approve' ? 'green' : 'red'}
                              >
                                {action.action_type.toUpperCase()}
                              </Badge>
                              <Text fontSize="sm" color="gray.600">
                                by {action.moderator.username}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(action.created_at).toLocaleString()}
                            </Text>
                          </HStack>
                          {action.reason && (
                            <Text fontSize="sm" color="gray.700">
                              {action.reason}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Moderation Action Modal */}
      <Modal isOpen={isActionOpen} onClose={onActionClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'approve' ? 'Approve Revision' : 'Reject Revision'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Reason (optional)</FormLabel>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Reason for ${actionType === 'approve' ? 'approving' : 'rejecting'} this revision...`}
                />
              </FormControl>
              <HStack spacing={3} justify="end">
                <Button variant="outline" onClick={onActionClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme={actionType === 'approve' ? 'green' : 'red'}
                  onClick={handleModerationAction}
                  isLoading={isSubmitting}
                  loadingText={actionType === 'approve' ? 'Approving...' : 'Rejecting...'}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default RevisionDetailPage;
