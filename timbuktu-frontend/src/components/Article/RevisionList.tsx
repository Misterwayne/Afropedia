// components/Article/RevisionList.tsx
import React, { SetStateAction, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  Text, 
  Badge, 
  Link as ChakraLink, 
  Divider, 
  Input, 
  Button, 
  useToast, 
  Collapse, 
  HStack, 
  VStack,
  Card,
  CardBody,
  Avatar,
  Flex,
  Spacer,
  Icon,
  IconButton,
  Tooltip,
  useColorModeValue,
  Heading,
  Stack,
  Container
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiUser, 
  FiMessageSquare, 
  FiEye, 
  FiGitBranch, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiEdit,
  FiSend
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Revision } from '@/types'; // Adjust path
import axios, { AxiosRequestConfig } from 'axios';
import RevisionDiff from './RevisionDiff';

interface RevisionListProps {
  revisions: Revision[];
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>;
  articleTitle: string; // Normalized title for potential future diff links
}

const RevisionList: React.FC<RevisionListProps> = ({ revisions, articleTitle, setRevisions }) => {
  const [newComment, setNewComment] = React.useState<string>('');
  const [commentingRevisionId, setCommentingRevisionId] = React.useState<number | null>(null);
  const [showDiff, setShowDiff] = React.useState<{ [key: number]: boolean }>({});
  const toast = useToast();
  const router = useRouter();

  

  if (!revisions || revisions.length === 0) {
    return <Text>No revision history found for this article.</Text>;
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const toggleDiff = (revisionId: number) => {
    setShowDiff(prev => ({
      ...prev,
      [revisionId]: !prev[revisionId]
    }));
  };

  const handleRevisionClick = (revisionId: number) => {
    router.push(`/revision/${revisionId}`);
  };

  const handleSubmit = async (revision : Revision) => { 
    try {
      const config: AxiosRequestConfig = {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }
      
      const response = await axios.patch(`http://localhost:8000/articles/${articleTitle}/revisions/${revision.id}`,
        {
          comment: newComment
        },  
        config
      );
      
      
      // Update the local state with the new comment
      setRevisions((prevRevisions: any) => {
        return prevRevisions.map((rev: any) => {
          if (rev.id === revision.id) {
            const newCommentObj = {
              id: response.data.comment.id,
              content: newComment,
              user_id: response.data.comment.user_id,
              created_at: response.data.comment.created_at,
              user: response.data.comment.user
            };
            return {
              ...rev,
              comments: rev.comments ? [...rev.comments, newCommentObj] : [newCommentObj]
            };
          }
          return rev;
        });
      });
      
      setNewComment('');
      setCommentingRevisionId(null);
      
      toast({
        title: "Success",
        description: "Comment added successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit comment.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }


  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  const getStatusIcon = (revision: Revision) => {
    if (revision.is_approved === true) return FiCheckCircle;
    if (revision.status === 'rejected') return FiXCircle;
    if (revision.status === 'pending') return FiAlertCircle;
    return FiAlertCircle;
  };

  const getStatusColor = (revision: Revision) => {
    if (revision.is_approved === true) return 'green';
    if (revision.status === 'rejected') return 'red';
    if (revision.status === 'pending') return 'yellow';
    return 'gray';
  };

  const getStatusText = (revision: Revision) => {
    if (revision.is_approved === true) return 'Approved';
    if (revision.status === 'rejected') return 'Rejected';
    if (revision.status === 'approved') return 'Approved';
    if (revision.status === 'pending') return 'Pending';
    return 'Unknown';
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

  return (
    <Container maxW="4xl" px={0}>
      <VStack spacing={4} align="stretch">
        {revisions.map((revision, index) => (
          <Card 
            key={revision.id}
            bg={cardBg}
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            _hover={{
              shadow: "lg",
              transform: "translateY(-2px)",
              borderColor: "african.300"
            }}
            transition="all 0.2s ease-in-out"
            cursor="pointer"
            onClick={() => handleRevisionClick(revision.id)}
          >
            <CardBody p={6}>
              {/* Header Section */}
              <Flex align="center" mb={4}>
                <Avatar
                  size="sm"
                  name={revision.user?.username || 'Anonymous'}
                  bg="african.500"
                  color="white"
                  mr={3}
                />
                <VStack align="start" spacing={0} flex={1}>
                  <HStack spacing={2}>
                    <Text fontWeight="semibold" color="gray.800">
                      {revision.user?.username || 'Anonymous'}
                    </Text>
                    <Badge 
                      colorScheme="gray"
                      size="sm"
                    >
                      user
                    </Badge>
                  </HStack>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FiClock} />
                    <Text>{formatTimeAgo(revision.timestamp)}</Text>
                    <Text>•</Text>
                    <Text>{new Date(revision.timestamp).toLocaleDateString()}</Text>
                  </HStack>
                </VStack>
                <Spacer />
                
                {/* Status Badge */}
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getStatusColor(revision)}
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Icon as={getStatusIcon(revision)} boxSize={3} />
                    {getStatusText(revision)}
                  </Badge>
                  {revision.needs_review === true && (
                    <Badge colorScheme="orange" variant="outline" px={2} py={1} borderRadius="full">
                      Review Needed
                    </Badge>
                  )}
                </HStack>
              </Flex>

              {/* Revision Comment */}
              {(revision as any).comment && (
                <Box mb={4} p={3} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderColor="african.500">
                  <Text fontSize="sm" color="gray.700" fontStyle="italic">
                    "{(revision as any).comment}"
                  </Text>
                </Box>
              )}

              {/* Comments Section */}
              {revision.comments && revision.comments.length > 0 && (
                <Box mb={4}>
                  <HStack mb={2}>
                    <Icon as={FiMessageSquare} color="gray.500" />
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Comments ({revision.comments.length})
                    </Text>
                  </HStack>
                  <VStack align="stretch" spacing={2} pl={4}>
                    {revision.comments.slice(0, 2).map((comment, idx) => (
                      <Box key={comment.id || idx} p={3} bg="gray.50" borderRadius="md">
                        <HStack mb={1}>
                          <Text fontSize="sm" fontWeight="medium" color="african.600">
                            {comment.user?.username || 'Anonymous'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatTimeAgo(comment.created_at)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.700">
                          {comment.content}
                        </Text>
                      </Box>
                    ))}
                    {revision.comments.length > 2 && (
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        +{revision.comments.length - 2} more comments
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Action Buttons */}
              <HStack spacing={3} pt={3} borderTop="1px solid" borderColor="gray.100">
                <Tooltip label="Add Comment">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiMessageSquare />}
                    colorScheme="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCommentingRevisionId(commentingRevisionId === revision.id ? null : revision.id);
                    }}
                  >
                    Comment
                  </Button>
                </Tooltip>
                
                <Tooltip label="View Changes">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiGitBranch />}
                    colorScheme="green"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDiff(revision.id);
                    }}
                  >
                    {showDiff[revision.id] ? 'Hide Diff' : 'Show Diff'}
                  </Button>
                </Tooltip>
                
                <Tooltip label="View Full Details">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiEye />}
                    colorScheme="purple"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevisionClick(revision.id);
                    }}
                  >
                    Details
                  </Button>
                </Tooltip>
                
                <Spacer />
                
                <Text fontSize="xs" color="gray.500">
                  Revision #{revision.id}
                </Text>
              </HStack>

              {/* Comment Input */}
              {commentingRevisionId === revision.id && (
                <Box 
                  mt={4} 
                  p={4} 
                  bg="gray.50" 
                  borderRadius="md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Add a comment:
                    </Text>
                    <Input
                      placeholder="Share your thoughts on this revision..."
                      value={newComment}
                      onChange={handleCommentChange}
                      bg="white"
                      borderColor="gray.300"
                      _focus={{ borderColor: "african.500", boxShadow: "0 0 0 1px african.500" }}
                    />
                    <HStack justify="flex-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCommentingRevisionId(null);
                          setNewComment('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="african"
                        leftIcon={<FiSend />}
                        onClick={() => handleSubmit(revision)}
                        isDisabled={!newComment.trim()}
                      >
                        Submit
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Diff Section */}
              {showDiff[revision.id] && (
                <Box 
                  mt={4} 
                  p={4} 
                  bg="gray.50" 
                  borderRadius="md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HStack mb={3}>
                    <Icon as={FiGitBranch} color="green.500" />
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Changes in this revision
                    </Text>
                  </HStack>
                  <RevisionDiff 
                    revisionId={revision.id} 
                    articleTitle={articleTitle} 
                  />
                </Box>
              )}
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Container>
  );
};

export default RevisionList;