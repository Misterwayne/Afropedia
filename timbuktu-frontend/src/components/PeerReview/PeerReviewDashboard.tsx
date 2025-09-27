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
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  Avatar,
  Flex,
  Spacer,
  Heading,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import {
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUsers,
  FiStar,
  FiFilter,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiMessageSquare,
  FiBarChart
} from 'react-icons/fi';
import axios from 'axios';
import Link from 'next/link';

interface ReviewMetrics {
  total_reviews: number;
  average_score: number;
  completion_rate: number;
  average_time_minutes: number;
  accuracy_score: number;
  helpfulness_score: number;
  last_review_date: string;
  reviewer_name: string;
  reviewer_level: string;
}


interface PeerReview {
  id: number;
  revision_id: number;
  reviewer_id: number;
  status: string;
  priority?: string;
  overall_score?: number;
  criteria_scores?: Record<string, number>;
  summary?: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string;
  detailed_feedback?: string;
  time_spent_minutes?: number;
  confidence_level?: number;
  created_at: string;
  completed_at?: string;
  score?: number;
  feedback?: string;
  reviewer_name?: string;
}

const PeerReviewDashboard: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [pendingRevisions, setPendingRevisions] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRevision, setSelectedRevision] = useState<any>(null);
  const [reviewInProgress, setReviewInProgress] = useState<number | null>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    console.log('Auth check - isAuthenticated:', isAuthenticated(), 'user:', user);
    
    if (isAuthenticated() && user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.id) {
        console.log('No user data available');
        setLoading(false);
        return;
      }
      
      const userId = user.id;
      
      const [metricsRes, pendingRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:8000/peer-review/metrics/reviewer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.log('Metrics request failed:', err.response?.status);
          return { data: null };
        }),
        axios.get('http://localhost:8000/moderation/pending-revisions', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.log('Pending revisions request failed:', err.response?.status);
          return { data: [] };
        }),
        axios.get(`http://localhost:8000/moderation/reviews/reviewer/${userId}?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.log('Reviews request failed:', err.response?.status);
          return { data: [] };
        })
      ]);

      setMetrics(metricsRes.data);
      setPendingRevisions(pendingRes.data);
      setMyReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load peer review data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = async (revisionId: number) => {
    try {
      setReviewInProgress(revisionId);
      
      const response = await axios.post(`http://localhost:8000/moderation/start-review/${revisionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Review Started",
        description: "You can now review this revision",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh data to show the new review
      fetchDashboardData();
    } catch (error) {
      console.error('Error starting review:', error);
      toast({
        title: "Error",
        description: "Failed to start review. You may have already reviewed this revision.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setReviewInProgress(null);
    }
  };



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'urgent': return 'orange';
      case 'high': return 'yellow';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return FiCheckCircle;
      case 'in_progress': return FiClock;
      case 'pending': return FiAlertCircle;
      case 'overdue': return FiXCircle;
      default: return FiAlertCircle;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading peer review dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access the peer review dashboard. Please log in first.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Peer Review Dashboard
            </Heading>
            <Text color="gray.600">
              Manage your review assignments and track your performance
            </Text>
          </Box>
          <HStack spacing={3}>
            <Link href="/peer-review/analytics" passHref>
              <Button leftIcon={<FiBarChart />} variant="outline" size="sm">
                Analytics
              </Button>
            </Link>
          </HStack>
        </Flex>

        {/* Metrics Cards */}
        {metrics && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Reviews</StatLabel>
                  <StatNumber color="blue.500">{metrics.total_reviews}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    All time reviews
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Average Score</StatLabel>
                  <StatNumber color="green.500">{metrics.average_score.toFixed(1)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Out of 5.0
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Completion Rate</StatLabel>
                  <StatNumber color="purple.500">{metrics.completion_rate.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Reviews completed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Avg. Time</StatLabel>
                  <StatNumber color="orange.500">{metrics.average_time_minutes.toFixed(0)}m</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Per review
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>
        )}

        {/* Main Content Tabs */}
        <Tabs index={selectedTab} onChange={setSelectedTab}>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiAlertCircle} />
                <Text>Pending Revisions</Text>
                {pendingRevisions.length > 0 && (
                  <Badge colorScheme="red" borderRadius="full">
                    {pendingRevisions.length}
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiClock} />
                <Text>In Progress</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} />
                <Text>Completed</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiBarChart} />
                <Text>Analytics</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Pending Assignments Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {pendingRevisions.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No pending revisions</AlertTitle>
                    <AlertDescription>
                      There are no revisions waiting for peer review at the moment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  pendingRevisions.map((revision) => {
                    const hasUserReviewed = revision.reviews?.some((review: any) => review.reviewer_id === user?.id);
                    const needsMoreReviews = revision.existing_reviews < 5;
                    
                    return (
                      <Card key={revision.id} bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Flex align="center" justify="space-between">
                            <VStack align="start" spacing={2} flex="1">
                              <HStack spacing={3}>
                                <Badge colorScheme="blue">
                                  Revision #{revision.id}
                                </Badge>
                                <Badge colorScheme={needsMoreReviews ? "yellow" : "green"}>
                                  {revision.existing_reviews} reviews
                                </Badge>
                                <Text fontSize="sm" color="gray.600">
                                  Article: {revision.article_title}
                                </Text>
                              </HStack>
                              <Text fontWeight="medium">
                                By: {revision.author_username}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(revision.timestamp).toLocaleString()}
                              </Text>
                              {revision.comment && (
                                <Text fontSize="sm" color="gray.700" fontStyle="italic">
                                  "{revision.comment}"
                                </Text>
                              )}
                              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                {revision.content.substring(0, 200)}...
                              </Text>
                            </VStack>
                            <VStack spacing={2}>
                              {!hasUserReviewed ? (
                                <Button
                                  colorScheme="purple"
                                  size="sm"
                                  leftIcon={<FiEye />}
                                  onClick={() => handleStartReview(revision.id)}
                                  isLoading={reviewInProgress === revision.id}
                                  loadingText="Starting..."
                                >
                                  Start Review
                                </Button>
                              ) : (
                                <Badge colorScheme="green" p={2}>
                                  Already Reviewed
                                </Badge>
                              )}
                              <Text fontSize="xs" color="gray.500" textAlign="center">
                                Needs {Math.max(0, 5 - revision.existing_reviews)} more reviews
                              </Text>
                            </VStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </VStack>
            </TabPanel>

            {/* In Progress Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {myReviews.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No reviews yet</AlertTitle>
                    <AlertDescription>
                      You haven't completed any reviews yet. Start reviewing revisions from the Pending tab.
                    </AlertDescription>
                  </Alert>
                ) : (
                  myReviews.map((review) => (
                      <Card key={review.id} bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Flex align="center" justify="space-between">
                            <VStack align="start" spacing={2}>
                              <HStack spacing={3}>
                                <Badge colorScheme={getStatusColor(review.status)}>
                                  {review.status}
                                </Badge>
                                <Badge colorScheme={getPriorityColor(review.priority || 'medium')}>
                                  {review.priority || 'medium'}
                                </Badge>
                              </HStack>
                              <Text fontWeight="medium">
                                Review #{review.id} - Revision #{review.revision_id}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Started: {new Date(review.created_at).toLocaleDateString()}
                              </Text>
                              {review.time_spent_minutes && review.time_spent_minutes > 0 && (
                                <Text fontSize="xs" color="gray.500">
                                  Time spent: {review.time_spent_minutes} minutes
                                </Text>
                              )}
                            </VStack>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<FiEdit />}
                                onClick={() => window.open(`/peer-review/${review.id}`, '_blank')}
                              >
                                Continue Review
                              </Button>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FiMoreVertical />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem icon={<FiEye />}>View Details</MenuItem>
                                  <MenuItem icon={<FiMessageSquare />}>Add Comment</MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))
                )}
              </VStack>
            </TabPanel>

            {/* Completed Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {myReviews.filter(r => r.status === 'completed').length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No completed reviews</AlertTitle>
                    <AlertDescription>
                      You haven't completed any reviews yet.
                    </AlertDescription>
                  </Alert>
                ) : (
                  myReviews
                    .filter(r => r.status === 'completed')
                    .map((review) => (
                      <Card key={review.id} bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Flex align="center" justify="space-between">
                            <VStack align="start" spacing={2}>
                              <HStack spacing={3}>
                                <Badge colorScheme={getStatusColor(review.status)}>
                                  {review.status}
                                </Badge>
                                {review.overall_score && (
                                  <Badge colorScheme="green">
                                    {review.overall_score}/5.0
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontWeight="medium">
                                Review #{review.id} - Revision #{review.revision_id}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Completed: {review.completed_at ? new Date(review.completed_at).toLocaleDateString() : 'Not completed'}
                              </Text>
                              {review.summary && (
                                <Text fontSize="sm" color="gray.700" noOfLines={2}>
                                  {review.summary}
                                </Text>
                              )}
                            </VStack>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<FiEye />}
                                onClick={() => window.open(`/peer-review/${review.id}`, '_blank')}
                              >
                                View
                              </Button>
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))
                )}
              </VStack>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Review Performance</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <CircularProgress
                        value={metrics?.completion_rate || 0}
                        color="green.500"
                        size="120px"
                      >
                        <CircularProgressLabel>
                          {metrics?.completion_rate.toFixed(0) || 0}%
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Completion Rate
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Quality Metrics</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <Box w="100%">
                        <Text fontSize="sm" mb={2}>Accuracy Score</Text>
                        <Progress value={(metrics?.accuracy_score || 0) * 20} colorScheme="blue" />
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          {metrics?.accuracy_score.toFixed(1) || 0}/5.0
                        </Text>
                      </Box>
                      <Box w="100%">
                        <Text fontSize="sm" mb={2}>Helpfulness Score</Text>
                        <Progress value={(metrics?.helpfulness_score || 0) * 20} colorScheme="green" />
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          {metrics?.helpfulness_score.toFixed(1) || 0}/5.0
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>


    </Box>
  );
};

export default PeerReviewDashboard;
