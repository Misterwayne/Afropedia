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
  Td,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spacer,
  Heading,
  Icon,
  useColorModeValue,
  Code,
  Link
} from '@chakra-ui/react';
import {
  FiStar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiMessageSquare,
  FiSave,
  FiSend,
  FiEye,
  FiEdit,
  FiBarChart,
  FiTarget,
  FiUsers,
  FiAward,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import axios from 'axios';

interface ReviewCriteria {
  accuracy: number;
  clarity: number;
  completeness: number;
  sources: number;
  neutrality: number;
  style: number;
  technical: number;
  factual: number;
}

interface PeerReview {
  id: number;
  revision_id: number;
  reviewer_id: number;
  status: string;
  priority: string;
  overall_score: number;
  criteria_scores: ReviewCriteria;
  summary: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  detailed_feedback: string;
  time_spent_minutes: number;
  confidence_level: number;
  created_at: string;
  completed_at: string;
  reviewer_name: string;
}

interface Revision {
  id: number;
  content: string;
  comment: string;
  timestamp: string;
  user_id: number;
  user: {
    username: string;
  };
}

interface ReviewTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  criteria: Record<string, number>;
  instructions: string;
  is_default: boolean;
}

const AdvancedPeerReviewInterface: React.FC<{ reviewId: number }> = ({ reviewId }) => {
  const [review, setReview] = useState<PeerReview | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Review form state
  const [status, setStatus] = useState('pending');
  const [overallScore, setOverallScore] = useState(3);
  const [criteriaScores, setCriteriaScores] = useState<ReviewCriteria>({
    accuracy: 3,
    clarity: 3,
    completeness: 3,
    sources: 3,
    neutrality: 3,
    style: 3,
    technical: 3,
    factual: 3
  });
  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // UI state
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewMode, setPreviewMode] = useState(false);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchReviewData();
    fetchTemplates();
  }, [reviewId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [reviewRes, revisionRes] = await Promise.all([
        axios.get(`http://localhost:8000/peer-review/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/articles/revisions/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const reviewData = reviewRes.data;
      setReview(reviewData);
      
      // Populate form with existing data
      if (reviewData) {
        setStatus(reviewData.status);
        setOverallScore(reviewData.overall_score || 3);
        setCriteriaScores(reviewData.criteria_scores || criteriaScores);
        setSummary(reviewData.summary || '');
        setStrengths(reviewData.strengths || '');
        setWeaknesses(reviewData.weaknesses || '');
        setSuggestions(reviewData.suggestions || '');
        setDetailedFeedback(reviewData.detailed_feedback || '');
        setConfidenceLevel(reviewData.confidence_level || 3);
        setTimeSpent(reviewData.time_spent_minutes || 0);
      }

      setRevision(revisionRes.data);
    } catch (error) {
      console.error('Error fetching review data:', error);
      toast({
        title: "Error",
        description: "Failed to load review data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8000/peer-review/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCriteriaChange = (criterion: keyof ReviewCriteria, value: number) => {
    setCriteriaScores(prev => ({
      ...prev,
      [criterion]: value
    }));
    
    // Auto-calculate overall score
    const newScores = { ...criteriaScores, [criterion]: value };
    const avgScore = Object.values(newScores).reduce((sum, score) => sum + score, 0) / Object.keys(newScores).length;
    setOverallScore(Math.round(avgScore * 10) / 10);
  };

  const handleSaveReview = async (isDraft: boolean = true) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const updateData = {
        status: isDraft ? 'in_progress' : status,
        overall_score: overallScore,
        criteria_scores: criteriaScores,
        summary,
        strengths,
        weaknesses,
        suggestions,
        detailed_feedback: detailedFeedback,
        confidence_level: confidenceLevel,
        time_spent_minutes: timeSpent
      };

      await axios.patch(`http://localhost:8000/peer-review/reviews/${reviewId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: isDraft ? "Review Saved" : "Review Completed",
        description: isDraft ? "Your review has been saved as draft" : "Your review has been completed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (!isDraft) {
        // Redirect or refresh
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: "Error",
        description: "Failed to save review",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: ReviewTemplate) => {
    setSelectedTemplate(template);
    if (template.criteria) {
      const newCriteriaScores = { ...criteriaScores };
      Object.keys(template.criteria).forEach(key => {
        if (key in newCriteriaScores) {
          newCriteriaScores[key as keyof ReviewCriteria] = Math.round(template.criteria[key] * 5);
        }
      });
      setCriteriaScores(newCriteriaScores);
    }
    setDetailedFeedback(template.instructions);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'green';
    if (score >= 3) return 'yellow';
    return 'red';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading review interface...</Text>
        </VStack>
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
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Peer Review #{reviewId}
            </Heading>
            <Text color="gray.600">
              Reviewing revision #{revision.id} by {revision.user.username}
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiEye />}
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="blue"
              variant="outline"
              onClick={() => handleSaveReview(true)}
              isLoading={saving}
            >
              Save Draft
            </Button>
            <Button
              leftIcon={<FiSend />}
              colorScheme="green"
              onClick={() => handleSaveReview(false)}
              isLoading={saving}
            >
              Complete Review
            </Button>
          </HStack>
        </Flex>

        {/* Review Progress */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <HStack spacing={6}>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Overall Score</Text>
                <CircularProgress
                  value={overallScore * 20}
                  color={getScoreColor(overallScore)}
                  size="60px"
                >
                  <CircularProgressLabel>
                    {overallScore.toFixed(1)}
                  </CircularProgressLabel>
                </CircularProgress>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Confidence Level</Text>
                <CircularProgress
                  value={confidenceLevel * 20}
                  color="blue"
                  size="60px"
                >
                  <CircularProgressLabel>
                    {confidenceLevel}/5
                  </CircularProgressLabel>
                </CircularProgress>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Time Spent</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {timeSpent}m
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Status</Text>
                <Badge colorScheme={getStatusColor(status)} size="lg">
                  {status}
                </Badge>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Main Content */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Left Column - Review Form */}
          <VStack spacing={6} align="stretch">
            {/* Revision Content */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Revision Content</Heading>
                  <Badge colorScheme="blue">ID: {revision.id}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Author: {revision.user.username} • 
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

            {/* Review Form */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Review Form</Heading>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiTarget />}
                    onClick={onOpen}
                  >
                    Use Template
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <Tabs index={activeTab} onChange={setActiveTab}>
                  <TabList>
                    <Tab>Scores</Tab>
                    <Tab>Feedback</Tab>
                    <Tab>Summary</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Scores Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        {/* Overall Score */}
                        <FormControl>
                          <FormLabel>Overall Score: {overallScore}/5</FormLabel>
                          <Slider
                            value={overallScore}
                            onChange={setOverallScore}
                            min={1}
                            max={5}
                            step={0.1}
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

                        <Divider />

                        {/* Criteria Scores */}
                        <VStack spacing={4} align="stretch">
                          <Text fontWeight="medium">Detailed Criteria Scoring</Text>
                          {Object.entries(criteriaScores).map(([criterion, score]) => (
                            <FormControl key={criterion}>
                              <FormLabel textTransform="capitalize">
                                {criterion.replace('_', ' ')}: {score}/5
                              </FormLabel>
                              <Slider
                                value={score}
                                onChange={(value) => handleCriteriaChange(criterion as keyof ReviewCriteria, value)}
                                min={1}
                                max={5}
                                step={1}
                                colorScheme={getScoreColor(score)}
                              >
                                <SliderTrack>
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                            </FormControl>
                          ))}
                        </VStack>

                        {/* Confidence Level */}
                        <FormControl>
                          <FormLabel>Confidence Level: {confidenceLevel}/5</FormLabel>
                          <Slider
                            value={confidenceLevel}
                            onChange={setConfidenceLevel}
                            min={1}
                            max={5}
                            step={1}
                            colorScheme="purple"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="sm" color="gray.600">Low (1)</Text>
                            <Text fontSize="sm" color="gray.600">High (5)</Text>
                          </HStack>
                        </FormControl>
                      </VStack>
                    </TabPanel>

                    {/* Feedback Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Strengths</FormLabel>
                          <Textarea
                            value={strengths}
                            onChange={(e) => setStrengths(e.target.value)}
                            placeholder="What are the strengths of this revision?"
                            rows={4}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Weaknesses</FormLabel>
                          <Textarea
                            value={weaknesses}
                            onChange={(e) => setWeaknesses(e.target.value)}
                            placeholder="What are the areas that need improvement?"
                            rows={4}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Suggestions</FormLabel>
                          <Textarea
                            value={suggestions}
                            onChange={(e) => setSuggestions(e.target.value)}
                            placeholder="What specific suggestions do you have for improvement?"
                            rows={4}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Detailed Feedback</FormLabel>
                          <Textarea
                            value={detailedFeedback}
                            onChange={(e) => setDetailedFeedback(e.target.value)}
                            placeholder="Provide detailed feedback on the revision..."
                            rows={6}
                          />
                        </FormControl>
                      </VStack>
                    </TabPanel>

                    {/* Summary Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Review Summary</FormLabel>
                          <Textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Provide a brief summary of your review..."
                            rows={3}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Time Spent (minutes)</FormLabel>
                          <Input
                            type="number"
                            value={timeSpent}
                            onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                            placeholder="Enter time spent reviewing"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Review Status</FormLabel>
                          <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="needs_changes">Needs Changes</option>
                          </Select>
                        </FormControl>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>

          {/* Right Column - Review Tools */}
          <VStack spacing={6} align="stretch">
            {/* Review Templates */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Review Templates</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {templates.slice(0, 3).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      justifyContent="flex-start"
                    >
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{template.name}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {template.description}
                        </Text>
                      </VStack>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpen}
                  >
                    View All Templates
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Review Guidelines */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Review Guidelines</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text fontWeight="medium" fontSize="sm">Accuracy</Text>
                    <Text fontSize="xs" color="gray.600">
                      Check for factual correctness and proper citations
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm">Clarity</Text>
                    <Text fontSize="xs" color="gray.600">
                      Ensure the content is clear and well-structured
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm">Completeness</Text>
                    <Text fontSize="xs" color="gray.600">
                      Verify all necessary information is included
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm">Neutrality</Text>
                    <Text fontSize="xs" color="gray.600">
                      Ensure balanced and unbiased presentation
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Review Statistics */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Review Statistics</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Average Score</Text>
                    <Badge colorScheme={getScoreColor(overallScore)}>
                      {overallScore.toFixed(1)}/5
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Confidence</Text>
                    <Badge colorScheme="blue">
                      {confidenceLevel}/5
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Time Spent</Text>
                    <Text fontSize="sm" color="gray.600">
                      {timeSpent} minutes
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>

      {/* Template Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Review Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              {templates.map((template) => (
                <Card key={template.id} variant="outline" cursor="pointer" onClick={() => applyTemplate(template)}>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="medium">{template.name}</Text>
                        <Badge colorScheme="blue">{template.category}</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {template.description}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {template.instructions}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedPeerReviewInterface;
