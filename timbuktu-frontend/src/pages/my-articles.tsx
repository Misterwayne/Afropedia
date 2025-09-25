import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import { FiSearch, FiPlus, FiEdit, FiEye, FiClock, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import apiClient from '@/lib/api';

interface Article {
  id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  is_featured?: boolean;
}

const MyArticlesPage: React.FC = () => {
  const { user, isAuthenticated, isAuthCheckComplete } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchMyArticles();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, statusFilter, sortBy]);

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setArticles([]);
        return;
      }

      // Try to fetch user's articles - this endpoint might not exist yet
      const response = await apiClient.get(`/articles/user/${user.id}`, {
        params: { status: statusFilter === 'all' ? undefined : statusFilter, sort: sortBy }
      }).catch(() => {
        // If endpoint doesn't exist, try to get all articles and filter by user
        return apiClient.get('/articles/').then(res => ({
          data: res.data.filter((article: any) => article.author_id === user.id || article.user_id === user.id)
        }));
      });
      
      // Transform the data to match our interface
      const transformedArticles = response.data.map((article: any) => ({
        id: article.id,
        title: article.title,
        status: article.status || 'published', // Default to published if no status
        created_at: article.created_at,
        updated_at: article.updated_at,
        view_count: article.view_count || 0,
        is_featured: article.is_featured || false,
      }));
      
      setArticles(transformedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load your articles. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'gray';
      case 'under_review': return 'yellow';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'under_review': return 'Under Review';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || article.status === statusFilter)
  );

  if (!isAuthCheckComplete) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="african.500" />
      </Center>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to view your articles.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <Heading as="h1" size="xl" color="african.800" mb={2}>
              My Articles
            </Heading>
            <Text color="gray.600">
              Manage your contributions to Afropedia
            </Text>
          </Box>
          <Link href="/edit/new" passHref>
            <Button leftIcon={<FiPlus />} colorScheme="african" size="lg">
              Create New Article
            </Button>
          </Link>
        </Flex>

        {/* Filters and Search */}
        <Card>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={4}>
              <GridItem>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search your articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </GridItem>
              <GridItem>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="under_review">Under Review</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </GridItem>
              <GridItem>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                  <option value="view_count">View Count</option>
                </Select>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Articles List */}
        {loading ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Spinner size="xl" color="african.500" />
              <Text>Loading your articles...</Text>
            </VStack>
          </Center>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No articles match your filters' 
                    : 'My Articles feature is coming soon'
                  }
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
                  We're working on adding the ability to track and manage your articles.
                  <br />
                  For now, you can create articles and they'll be available in the main browse section.
                </Text>
                <Link href="/edit/new" passHref>
                  <Button leftIcon={<FiPlus />} colorScheme="african" mt={4}>
                    Create New Article
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredArticles.map((article) => (
              <Card key={article.id} _hover={{ shadow: 'md' }} transition="all 0.2s">
                <CardBody>
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={3}>
                        <Heading size="md" color="african.800">
                          {article.title}
                        </Heading>
                        <Badge colorScheme={getStatusColor(article.status)}>
                          {getStatusText(article.status)}
                        </Badge>
                        {article.is_featured && (
                          <Badge colorScheme="purple">Featured</Badge>
                        )}
                      </HStack>
                      
                      <HStack spacing={6} fontSize="sm" color="gray.600">
                        <HStack spacing={1}>
                          <FiClock />
                          <Text>
                            Updated {new Date(article.updated_at).toLocaleDateString()}
                          </Text>
                        </HStack>
                        {article.view_count !== undefined && (
                          <HStack spacing={1}>
                            <FiEye />
                            <Text>{article.view_count} views</Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>

                    <HStack spacing={2}>
                      <Link href={`/wiki/${article.title.replace(/\s+/g, '_')}`} passHref>
                        <IconButton
                          aria-label="View article"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          colorScheme="african"
                        />
                      </Link>
                      <Link href={`/edit/${article.title.replace(/\s+/g, '_')}`} passHref>
                        <IconButton
                          aria-label="Edit article"
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                          colorScheme="african"
                        />
                      </Link>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="More options"
                          icon={<FiMoreVertical />}
                          size="sm"
                          variant="ghost"
                        />
                        <MenuList>
                          <Link href={`/history/${article.title.replace(/\s+/g, '_')}`} passHref>
                            <MenuItem icon={<FiClock />}>View History</MenuItem>
                          </Link>
                          <Divider />
                          <MenuItem icon={<FiTrash2 />} color="red.500">
                            Delete Article
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default MyArticlesPage;
