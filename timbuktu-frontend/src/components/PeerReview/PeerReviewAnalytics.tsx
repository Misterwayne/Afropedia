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
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  FormControl,
  FormLabel,
  Flex,
  Spacer,
  Heading,
  Icon,
  useColorModeValue,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiClock,
  FiStar,
  FiBarChart,
  FiTarget,
  FiAward,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
  FiDownload,
  FiFilter
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

interface ReviewAnalytics {
  total_reviews: number;
  average_score: number;
  completion_rate: number;
  average_review_time: number;
  top_reviewers: Array<{
    reviewer_id: number;
    review_count: number;
  }>;
  review_trends: Array<{
    date: string;
    count: number;
    score: number;
  }>;
  quality_metrics: Record<string, number>;
}

interface ReviewerProfile {
  reviewer_id: number;
  name: string;
  level: string;
  total_reviews: number;
  average_score: number;
  completion_rate: number;
  specialties: string[];
  recent_activity: Array<{
    date: string;
    action: string;
    score: number;
  }>;
}

const PeerReviewAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [topReviewers, setTopReviewers] = useState<ReviewerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('score');
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Real data will be fetched from API
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [reviewerData, setReviewerData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Try to fetch analytics data from the moderation endpoint
      const response = await axios.get('http://localhost:8000/moderation/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // For now, set basic analytics from moderation stats
      if (response.data) {
        setAnalytics({
          total_reviews: response.data.total_reviews || 0,
          average_score: response.data.average_score || 0,
          completion_rate: response.data.completion_rate || 0,
          average_review_time: response.data.average_review_time || 0,
          top_reviewers: [],
          review_trends: [],
          quality_metrics: {}
        });
      }

      // Set empty data for charts (will be implemented later)
      setTrendData([]);
      setCategoryData([]);
      setReviewerData([]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default values when API fails
      setAnalytics({
        total_reviews: 0,
        average_score: 0,
        completion_rate: 0,
        average_review_time: 0,
        top_reviewers: [],
        review_trends: [],
        quality_metrics: {}
      });
      setTrendData([]);
      setCategoryData([]);
      setReviewerData([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'green';
    if (score >= 3) return 'yellow';
    return 'red';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return FiTrendingUp;
      case 'down': return FiTrendingDown;
      default: return FiBarChart;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading analytics...</Text>
        </VStack>
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
              Peer Review Analytics
            </Heading>
            <Text color="gray.600">
              Comprehensive insights into review performance and trends
            </Text>
          </Box>
          <HStack spacing={3}>
            <FormControl w="200px">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                size="sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </Select>
            </FormControl>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchAnalyticsData}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              size="sm"
            >
              Export
            </Button>
          </HStack>
        </Flex>

        {/* Key Metrics */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Reviews</StatLabel>
                <StatNumber color="blue.500">
                  {analytics?.total_reviews || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Average Score</StatLabel>
                <StatNumber color="green.500">
                  {analytics?.average_score.toFixed(1) || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +0.2 from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Completion Rate</StatLabel>
                <StatNumber color="purple.500">
                  {analytics?.completion_rate.toFixed(1) || 0}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +3% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Avg. Review Time</StatLabel>
                <StatNumber color="orange.500">
                  {analytics?.average_review_time.toFixed(0) || 0}m
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  -5m from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Charts and Detailed Analytics */}
        <Tabs>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiBarChart} />
                <Text>Overview</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiUsers} />
                <Text>Reviewers</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiTarget} />
                <Text>Quality Metrics</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiTrendingUp} />
                <Text>Trends</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
                {/* Review Trends Chart */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Review Trends</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="300px">
                      {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <VStack h="100%" justify="center" spacing={4}>
                          <Text color="gray.500" fontSize="lg">No trend data available</Text>
                          <Text color="gray.400" fontSize="sm">Chart will populate as reviews are completed</Text>
                        </VStack>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Score Distribution */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Score Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <CircularProgress
                        value={(analytics?.average_score || 0) * 20}
                        color="green.500"
                        size="120px"
                      >
                        <CircularProgressLabel>
                          {analytics?.average_score.toFixed(1) || 0}
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Average Score
                      </Text>
                      <VStack spacing={2} w="100%">
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Score distribution will be available as more reviews are completed
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Reviewers Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Top Reviewers Chart */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Top Reviewers</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="300px">
                      {reviewerData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reviewerData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="reviews" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <VStack h="100%" justify="center" spacing={4}>
                          <Text color="gray.500" fontSize="lg">No reviewer data available</Text>
                          <Text color="gray.400" fontSize="sm">Data will appear as reviewers complete reviews</Text>
                        </VStack>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Reviewers Table */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Reviewer Performance</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Reviewer</Th>
                          <Th>Reviews</Th>
                          <Th>Avg. Score</Th>
                          <Th>Completion</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {reviewerData.length > 0 ? (
                          reviewerData.map((reviewer, index) => (
                            <Tr key={index}>
                              <Td>
                                <HStack>
                                  <Text fontWeight="medium">{reviewer.name}</Text>
                                  {index < 3 && (
                                    <Badge colorScheme="gold" size="sm">
                                      Top {index + 1}
                                    </Badge>
                                  )}
                                </HStack>
                              </Td>
                              <Td>{reviewer.reviews}</Td>
                              <Td>
                                <Badge colorScheme={getScoreColor(reviewer.score)}>
                                  {reviewer.score.toFixed(1)}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack>
                                  <Progress
                                    value={reviewer.completion}
                                    colorScheme="green"
                                    size="sm"
                                    w="100px"
                                  />
                                  <Text fontSize="sm">{reviewer.completion}%</Text>
                                </HStack>
                              </Td>
                              <Td>
                                <Badge colorScheme="green" size="sm">
                                  Active
                                </Badge>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={5} textAlign="center" py={8}>
                              <VStack spacing={2}>
                                <Text color="gray.500">No reviewer data available</Text>
                                <Text color="gray.400" fontSize="sm">Reviewer performance will appear here</Text>
                              </VStack>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Quality Metrics Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                {/* Category Scores */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Category Scores</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="300px">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <VStack h="100%" justify="center" spacing={4}>
                          <Text color="gray.500" fontSize="lg">No quality metrics available</Text>
                          <Text color="gray.400" fontSize="sm">Category scores will appear as reviews are completed</Text>
                        </VStack>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Quality Trends */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Quality Trends</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {categoryData.length > 0 ? (
                        categoryData.map((category, index) => (
                          <Box key={index}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="medium">
                                {category.name}
                              </Text>
                              <Badge colorScheme={getScoreColor(category.value)}>
                                {category.value.toFixed(1)}
                              </Badge>
                            </HStack>
                            <Progress
                              value={category.value * 20}
                              colorScheme={getScoreColor(category.value)}
                              size="sm"
                            />
                          </Box>
                        ))
                      ) : (
                        <VStack spacing={4} py={8}>
                          <Text color="gray.500">No quality trend data available</Text>
                          <Text color="gray.400" fontSize="sm" textAlign="center">
                            Quality metrics will appear as detailed reviews are completed
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Trends Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Score Trends */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Score Trends Over Time</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="300px">
                      {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 5]} />
                            <RechartsTooltip />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#8884d8"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <VStack h="100%" justify="center" spacing={4}>
                          <Text color="gray.500" fontSize="lg">No trend data available</Text>
                          <Text color="gray.400" fontSize="sm">Score trends will appear as reviews are completed</Text>
                        </VStack>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Performance Indicators */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={3}>
                        <Icon as={FiThumbsUp} boxSize={8} color="green.500" />
                        <Text fontWeight="medium">High Quality</Text>
                        <Text fontSize="2xl" color="green.500">
                          {analytics?.total_reviews && analytics.total_reviews > 0 ? 'N/A' : '0%'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Reviews scoring 4+ stars
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={3}>
                        <Icon as={FiClock} boxSize={8} color="blue.500" />
                        <Text fontWeight="medium">Avg. Review Time</Text>
                        <Text fontSize="2xl" color="blue.500">
                          {analytics?.average_review_time ? `${analytics.average_review_time}m` : 'N/A'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Average completion time
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={3}>
                        <Icon as={FiAward} boxSize={8} color="purple.500" />
                        <Text fontWeight="medium">Completion Rate</Text>
                        <Text fontSize="2xl" color="purple.500">
                          {analytics?.completion_rate ? `${analytics.completion_rate.toFixed(0)}%` : '0%'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Review completion rate
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default PeerReviewAnalytics;
