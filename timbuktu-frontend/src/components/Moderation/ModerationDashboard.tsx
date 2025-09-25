import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
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
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import axios from 'axios';

interface ModerationQueueItem {
  id: number;
  content_type: string;
  content_id: number;
  submitted_by: number;
  priority: string;
  status: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
}

interface PeerReview {
  id: number;
  revision_id: number;
  reviewer_id: number;
  status: string;
  score?: number;
  feedback?: string;
  created_at: string;
}

interface RevisionSummary {
  revision_id: number;
  total_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  pending_reviews: number;
  average_score?: number;
  overall_status: string;
  reviews: PeerReview[];
}

interface ContentFlag {
  id: number;
  content_type: string;
  content_id: number;
  flagger_id: number;
  flag_type: string;
  reason: string;
  status: string;
  created_at: string;
}

interface ModerationStats {
  pending_moderation: number;
  in_review: number;
  pending_flags: number;
  total_queue_items: number;
}

const ModerationDashboard: React.FC = () => {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [queueItems, setQueueItems] = useState<ModerationQueueItem[]>([]);
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'assign' | 'assign_reviewers'>('approve');
  const [assignTo, setAssignTo] = useState('');
  const [selectedReviewers, setSelectedReviewers] = useState<number[]>([]);
  const [revisionSummary, setRevisionSummary] = useState<RevisionSummary | null>(null);
  const [availableReviewers, setAvailableReviewers] = useState<{id: number, username: string}[]>([]);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [statsRes, queueRes, flagsRes, reviewersRes] = await Promise.all([
        axios.get('http://localhost:8000/moderation/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/moderation/queue', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/moderation/flags', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // Fetch available reviewers (users with editor+ role)
        axios.get('http://localhost:8000/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setQueueItems(queueRes.data);
      setFlags(flagsRes.data);
      
      // Filter users who can be reviewers (editor, moderator, admin)
      const reviewers = reviewersRes.data.filter((user: any) => 
        ['editor', 'moderator', 'admin'].includes(user.role)
      ).map((user: any) => ({ id: user.id, username: user.username }));
      setAvailableReviewers(reviewers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisionSummary = async (revisionId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:8000/moderation/revision-summary/${revisionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRevisionSummary(response.data);
    } catch (error) {
      console.error('Error fetching revision summary:', error);
    }
  };

  const handleModerationAction = async (item: ModerationQueueItem, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (action === 'approve') {
        await axios.post('http://localhost:8000/moderation/approve', {
          content_type: item.content_type,
          content_id: item.content_id,
          reason: actionReason || 'Approved by moderator'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:8000/moderation/reject', {
          content_type: item.content_type,
          content_id: item.content_id,
          reason: actionReason || 'Rejected by moderator'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      toast({
        title: "Success",
        description: `Content ${action}d successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchDashboardData();
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing content:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} content`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAssignReviewers = async (revisionId: number, reviewerIds: number[]) => {
    try {
      const token = localStorage.getItem('authToken');
      
      await axios.post(`http://localhost:8000/moderation/assign-reviewers/${revisionId}`, reviewerIds, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Assigned ${reviewerIds.length} reviewers to revision`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      fetchDashboardData();
      if (revisionSummary && revisionSummary.revision_id === revisionId) {
        fetchRevisionSummary(revisionId);
      }
      onClose();
    } catch (error) {
      console.error('Error assigning reviewers:', error);
      toast({
        title: "Error",
        description: "Failed to assign reviewers",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAssignItem = async (item: ModerationQueueItem) => {
    try {
      const token = localStorage.getItem('authToken');
      
      await axios.post(`http://localhost:8000/moderation/queue/${item.id}/assign`, {
        assigned_to: parseInt(assignTo)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: "Item assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchDashboardData();
      onClose();
    } catch (error) {
      console.error('Error assigning item:', error);
      toast({
        title: "Error",
        description: "Failed to assign item",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openActionModal = (item: ModerationQueueItem, action: 'approve' | 'reject' | 'assign' | 'assign_reviewers') => {
    setSelectedItem(item);
    setSelectedAction(action);
    setActionReason('');
    setAssignTo('');
    setSelectedReviewers([]);
    if (action === 'assign_reviewers' && item.content_type === 'revision') {
      fetchRevisionSummary(item.content_id);
    }
    onOpen();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'in_review': return 'blue';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Moderation Dashboard
          </Text>
          <Text color="gray.600">
            Manage content moderation and peer reviews
          </Text>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <HStack spacing={4} wrap="wrap">
            <Card flex="1" minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>Pending Moderation</StatLabel>
                  <StatNumber color="orange.500">{stats.pending_moderation}</StatNumber>
                  <StatHelpText>Items awaiting review</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card flex="1" minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>In Review</StatLabel>
                  <StatNumber color="blue.500">{stats.in_review}</StatNumber>
                  <StatHelpText>Currently being reviewed</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card flex="1" minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>Pending Flags</StatLabel>
                  <StatNumber color="red.500">{stats.pending_flags}</StatNumber>
                  <StatHelpText>Content flags to review</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card flex="1" minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>Total Queue</StatLabel>
                  <StatNumber color="purple.500">{stats.total_queue_items}</StatNumber>
                  <StatHelpText>All queue items</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </HStack>
        )}

        {/* Main Content Tabs */}
        <Tabs>
          <TabList>
            <Tab>Moderation Queue</Tab>
            <Tab>Content Flags</Tab>
          </TabList>

          <TabPanels>
            {/* Moderation Queue Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">
                      Moderation Queue
                    </Text>
                    <Button onClick={fetchDashboardData} size="sm">
                      Refresh
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {queueItems.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>No items in queue</AlertTitle>
                      <AlertDescription>
                        There are currently no items awaiting moderation.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Content Type</Th>
                          <Th>Content ID</Th>
                          <Th>Priority</Th>
                          <Th>Status</Th>
                          <Th>Submitted</Th>
                          <Th>Peer Reviews</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {queueItems.map((item) => (
                          <Tr key={item.id}>
                            <Td>
                              <Badge colorScheme="blue">{item.content_type}</Badge>
                            </Td>
                            <Td>{item.content_id}</Td>
                            <Td>
                              <Badge colorScheme={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </Td>
                            <Td>{new Date(item.created_at).toLocaleDateString()}</Td>
                            <Td>
                              {item.content_type === 'revision' ? (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => fetchRevisionSummary(item.content_id)}
                                >
                                  View Reviews
                                </Button>
                              ) : (
                                <Text fontSize="sm" color="gray.500">N/A</Text>
                              )}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                {item.content_type === 'revision' && (
                                  <Button
                                    size="sm"
                                    colorScheme="purple"
                                    onClick={() => openActionModal(item, 'assign_reviewers')}
                                  >
                                    Assign Reviewers
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleModerationAction(item, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => handleModerationAction(item, 'reject')}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => openActionModal(item, 'assign')}
                                >
                                  Assign
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Content Flags Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="semibold">
                      Content Flags
                    </Text>
                    <Button onClick={fetchDashboardData} size="sm">
                      Refresh
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {flags.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>No content flags</AlertTitle>
                      <AlertDescription>
                        There are currently no content flags to review.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Content Type</Th>
                          <Th>Content ID</Th>
                          <Th>Flag Type</Th>
                          <Th>Reason</Th>
                          <Th>Status</Th>
                          <Th>Created</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {flags.map((flag) => (
                          <Tr key={flag.id}>
                            <Td>
                              <Badge colorScheme="blue">{flag.content_type}</Badge>
                            </Td>
                            <Td>{flag.content_id}</Td>
                            <Td>
                              <Badge colorScheme="red">{flag.flag_type}</Badge>
                            </Td>
                            <Td>{flag.reason}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(flag.status)}>
                                {flag.status}
                              </Badge>
                            </Td>
                            <Td>{new Date(flag.created_at).toLocaleDateString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAction === 'approve' && 'Approve Content'}
            {selectedAction === 'reject' && 'Reject Content'}
            {selectedAction === 'assign' && 'Assign Item'}
            {selectedAction === 'assign_reviewers' && 'Assign Peer Reviewers'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedItem && (
              <VStack spacing={4}>
                <Text>
                  {selectedAction === 'approve' && 'Are you sure you want to approve this content?'}
                  {selectedAction === 'reject' && 'Are you sure you want to reject this content?'}
                  {selectedAction === 'assign' && 'Assign this item to a moderator:'}
                  {selectedAction === 'assign_reviewers' && 'Select reviewers for this revision:'}
                </Text>
                
                {selectedAction === 'assign' ? (
                  <FormControl>
                    <FormLabel>Assign to User ID:</FormLabel>
                    <Input
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </FormControl>
                ) : selectedAction === 'assign_reviewers' ? (
                  <VStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Available Reviewers:</FormLabel>
                      <VStack spacing={2} align="stretch">
                        {availableReviewers.map((reviewer) => (
                          <HStack key={reviewer.id} justify="space-between">
                            <Text>{reviewer.username}</Text>
                            <Button
                              size="sm"
                              variant={selectedReviewers.includes(reviewer.id) ? "solid" : "outline"}
                              colorScheme="purple"
                              onClick={() => {
                                if (selectedReviewers.includes(reviewer.id)) {
                                  setSelectedReviewers(prev => prev.filter(id => id !== reviewer.id));
                                } else {
                                  setSelectedReviewers(prev => [...prev, reviewer.id]);
                                }
                              }}
                            >
                              {selectedReviewers.includes(reviewer.id) ? 'Remove' : 'Select'}
                            </Button>
                          </HStack>
                        ))}
                      </VStack>
                    </FormControl>
                    
                    {revisionSummary && (
                      <Box p={4} bg="gray.50" borderRadius="md" w="full">
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Current Review Status:</Text>
                        <HStack spacing={4}>
                          <Text fontSize="xs">Total: {revisionSummary.total_reviews}</Text>
                          <Text fontSize="xs" color="green.600">Approved: {revisionSummary.approved_reviews}</Text>
                          <Text fontSize="xs" color="red.600">Rejected: {revisionSummary.rejected_reviews}</Text>
                          <Text fontSize="xs" color="yellow.600">Pending: {revisionSummary.pending_reviews}</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Status: {revisionSummary.overall_status}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                ) : (
                  <FormControl>
                    <FormLabel>Reason (optional):</FormLabel>
                    <Textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Enter reason for this action"
                    />
                  </FormControl>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme={
                selectedAction === 'approve' ? 'green' : 
                selectedAction === 'reject' ? 'red' : 
                selectedAction === 'assign_reviewers' ? 'purple' : 'blue'
              }
              onClick={() => {
                if (selectedItem) {
                  if (selectedAction === 'assign') {
                    handleAssignItem(selectedItem);
                  } else if (selectedAction === 'assign_reviewers') {
                    handleAssignReviewers(selectedItem.content_id, selectedReviewers);
                  } else {
                    handleModerationAction(selectedItem, selectedAction);
                  }
                }
              }}
              isDisabled={selectedAction === 'assign_reviewers' && selectedReviewers.length === 0}
            >
              {selectedAction === 'approve' && 'Approve'}
              {selectedAction === 'reject' && 'Reject'}
              {selectedAction === 'assign' && 'Assign'}
              {selectedAction === 'assign_reviewers' && `Assign ${selectedReviewers.length} Reviewers`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ModerationDashboard;
