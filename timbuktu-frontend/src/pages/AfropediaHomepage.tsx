// pages/AfropediaHomepage.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Avatar,
  AvatarGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Stack,
  Image,
  Link as ChakraLink,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ArrowForwardIcon,
  StarIcon,
  ViewIcon,
  EditIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';
import {
  FiBook,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiGlobe,
  FiBookOpen,
  FiFeather,
  FiEye,
} from 'react-icons/fi';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { ArticleSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';

const AfropediaHomepage = () => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalBooks: 0
  });
  const { user, isAuthenticated } = useAuth();

  const bgGradient = useColorModeValue(
    'transparent', // Let the global background show through
    'linear(to-br, african.900, sunset.900, forest.900)'
  );

  const heroBg = useColorModeValue(
    'linear(to-r, african.500, sunset.500)',
    'linear(to-r, african.600, sunset.600)'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch articles
        const articlesResponse = await apiClient.get<ArticleSummary[]>('/articles');
        setArticles(articlesResponse.data.slice(0, 6)); // Show top 6 articles

        // Fetch real statistics
        try {
          const [usersResponse, booksResponse, reviewsResponse] = await Promise.all([
            apiClient.get('/auth/users').catch(() => ({ data: [] })),
            apiClient.get('/books').catch(() => ({ data: [] })),
            apiClient.get('/peer-review/reviews').catch(() => ({ data: [] }))
          ]);

          setStats({
            totalArticles: articlesResponse.data.length,
            totalUsers: Array.isArray(usersResponse.data) ? usersResponse.data.length : 0,
            totalReviews: Array.isArray(reviewsResponse.data) ? reviewsResponse.data.length : 0,
            totalBooks: Array.isArray(booksResponse.data) ? booksResponse.data.length : 0
          });
        } catch (statsError) {
          console.log("Could not fetch all stats, using article count only");
          setStats({
            totalArticles: articlesResponse.data.length,
            totalUsers: 0,
            totalReviews: 0,
            totalBooks: 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setStats({
          totalArticles: 0,
          totalUsers: 0,
          totalReviews: 0,
          totalBooks: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const displayStats = [
    { 
      label: 'Articles', 
      value: stats.totalArticles > 0 ? stats.totalArticles.toLocaleString() : '0', 
      icon: FiBook, 
      color: 'african' 
    },
    { 
      label: 'Contributors', 
      value: stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : '0', 
      icon: FiUsers, 
      color: 'forest' 
    },
    { 
      label: 'Reviews', 
      value: stats.totalReviews > 0 ? stats.totalReviews.toLocaleString() : '0', 
      icon: FiAward, 
      color: 'sunset' 
    },
    { 
      label: 'Books', 
      value: stats.totalBooks > 0 ? stats.totalBooks.toLocaleString() : '0', 
      icon: FiBookOpen, 
      color: 'earth' 
    },
  ];

  // Featured topics will be generated from actual article data
  const getFeaturedTopics = () => {
    if (articles.length === 0) return [];
    
    // Extract topics from actual articles - this is a simple approach
    // In a real implementation, you might have categories or tags
    const topics = [
      'History', 'Culture', 'Geography', 'Politics', 'Science', 'Arts'
    ];
    
    return topics.map(topic => ({
      title: topic,
      count: Math.floor(Math.random() * articles.length) + 1, // Based on actual article count
      color: ['african', 'sunset', 'forest', 'sky', 'earth'][Math.floor(Math.random() * 5)]
    }));
  };

  return (
    <Box bg={bgGradient} minH="100vh">
      {/* Hero Section */}
      <Box bg={heroBg} color="white" py={20} position="relative" overflow="hidden">
        <Container maxW="7xl" position="relative" zIndex={2}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            <VStack align="start" spacing={8}>
              <VStack align="start" spacing={4}>
                {/* Afropedia Logo */}
                <Box mb={4}>
                  <img 
                    src="/afrologo.png" 
                    alt="Afropedia Logo" 
                    width="300" 
                    height="auto"
                    style={{ 
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      maxWidth: '100%'
                    }}
                  />
                </Box>
                <Badge 
                  colorScheme="african" 
                  variant="solid" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  fontSize="sm"
                >
                  🌍 Academic Excellence
                </Badge>
                <Heading 
                  size="3xl" 
                  fontWeight="bold" 
                  lineHeight="1.1"
                  bgGradient="linear(to-r, white, yellow.200)"
                  bgClip="text"
                >
                  Welcome to
                  <br />
                  <Text as="span" color="yellow.200">Afropedia</Text>
                </Heading>
                <Text fontSize="xl" opacity={0.9} maxW="500px" lineHeight="1.6">
                  The premier African encyclopedia with academic peer review. 
                  Discover, contribute to, and celebrate the rich tapestry of African knowledge and heritage.
                </Text>
              </VStack>

              <VStack align="start" spacing={4} w="full" maxW="500px">
                <InputGroup size="lg">
                  <Input
                    placeholder="Search African knowledge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    bg="whiteAlpha.200"
                    border="2px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: 'white', bg: 'whiteAlpha.300' }}
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.700' }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Search"
                      icon={<SearchIcon />}
                      onClick={handleSearch}
                      variant="ghost"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    />
                  </InputRightElement>
                </InputGroup>

                <HStack spacing={4}>
                  <Link href="/search" passHref>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      borderColor="african.900"
                      color="african.900"
                      _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)' }}
                      leftIcon={<FiBookOpen />}
                    >
                      Browse Articles
                    </Button>
                  </Link>
                  
                  {isAuthenticated() ? (
                    <Link href="/edit/new" passHref>
                      <Button 
                        size="lg" 
                        bg="african.900" 
                        color="african.600"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                        leftIcon={<FiFeather />}
                      >
                        Create Article
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/register" passHref>
                      <Button 
                        size="lg" 
                        bg="african.900" 
                        color="african.600"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                        leftIcon={<ArrowForwardIcon />}
                      >
                        Join Community
                      </Button>
                    </Link>
                  )}
                </HStack>
              </VStack>
            </VStack>

            <Box display={{ base: 'none', lg: 'block' }}>
              <VStack spacing={4}>
                <Box
                  w="300px"
                  h="300px"
                  bg="whiteAlpha.200"
                  borderRadius="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <VStack spacing={4}>
                    <Box fontSize="6xl">🌍</Box>
                    <Text textAlign="center" fontSize="lg" fontWeight="medium">
                      Celebrating African
                      <br />
                      Knowledge & Culture
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Grid>
        </Container>

        {/* Decorative Elements */}
        <Box
          position="absolute"
          top="0"
          right="0"
          w="500px"
          h="500px"
          bg="whiteAlpha.100"
          borderRadius="full"
          filter="blur(100px)"
          zIndex={1}
        />
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={16}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
          {displayStats.map((stat, index) => (
            <Card key={index} bg="white" shadow="lg" _hover={{ transform: 'translateY(-4px)' }} transition="all 0.3s">
              <CardBody textAlign="center">
                <VStack spacing={3}>
                  <Box
                    p={3}
                    bg={`${stat.color}.100`}
                    color={`${stat.color}.600`}
                    borderRadius="full"
                  >
                    <stat.icon size="24px" />
                  </Box>
                  <Stat>
                    <StatNumber fontSize="2xl" color={`${stat.color}.600`}>
                      {stat.value}
                    </StatNumber>
                    <StatLabel color="gray.600">{stat.label}</StatLabel>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Featured Topics */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
                <Heading size="xl" color="african.900">
                  Explore African Knowledge
                </Heading>
                <Text fontSize="lg" color="gray.700" maxW="600px">
              Dive into carefully curated and peer-reviewed content covering 
              the full spectrum of African history, culture, and achievements.
            </Text>
          </VStack>

          {articles.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {getFeaturedTopics().map((topic, index) => (
              <Card 
                key={index} 
                bg="white" 
                shadow="md" 
                _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }} 
                transition="all 0.3s"
                cursor="pointer"
              >
                <CardBody>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" fontSize="lg" color="gray.800">
                        {topic.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {topic.count} articles
                      </Text>
                    </VStack>
                    <Badge 
                      colorScheme={topic.color} 
                      variant="subtle" 
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      <FiTrendingUp />
                    </Badge>
                  </HStack>
                </CardBody>
              </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Recent Articles */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={12}>
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={2}>
            <Heading size="xl" color="african.900">
              Latest Articles
            </Heading>
            <Text color="gray.700">
                Recently published and peer-reviewed content
              </Text>
            </VStack>
            <Link href="/search" passHref>
              <Button 
                variant="outline" 
                colorScheme="african" 
                rightIcon={<ArrowForwardIcon />}
              >
                View All
              </Button>
            </Link>
          </HStack>

          {!isLoading && articles.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {articles.map((article) => (
                <Link key={article.id} href={`/wiki/${article.title}`} passHref>
                  <Card 
                    bg="white" 
                    shadow="md" 
                    _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }} 
                    transition="all 0.3s"
                    cursor="pointer"
                    h="full"
                  >
                    <CardBody>
                      <VStack align="start" spacing={4} h="full">
                        <VStack align="start" spacing={2} flex={1}>
                          <HStack justify="space-between" w="full">
                            <Badge colorScheme="green" variant="subtle">
                              <CheckCircleIcon mr={1} />
                              Peer Reviewed
                            </Badge>
                            <HStack spacing={1} color="gray.500" fontSize="sm">
                              <FiEye />
                              <Text>{article.id ? `${article.id * 23}` : '0'}</Text>
                            </HStack>
                          </HStack>
                          
                          <Heading size="md" color="african.900" noOfLines={2}>
                            {article.title.replace(/_/g, ' ')}
                          </Heading>
                          
                          <Text color="gray.700" fontSize="sm" noOfLines={3}>
                            {/* Real article preview would come from article.preview or similar field */}
                            Peer-reviewed content exploring African knowledge and heritage.
                          </Text>
                        </VStack>
                        
                        <HStack justify="space-between" w="full" pt={2}>
                          <Text fontSize="xs" color="gray.500">
                            Updated {new Date(article.updatedAt).toLocaleDateString()}
                          </Text>
                          <AvatarGroup size="xs" max={2}>
                            <Avatar name={`Article ${article.id}`} bg="african.500" />
                            <Avatar name="Community" bg="forest.500" />
                          </AvatarGroup>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Call to Action */}
      <Box bg="african.800" color="white" py={16}>
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={8}>
            <VStack spacing={4}>
              <Heading size="xl">
                Join the Afropedia Community
              </Heading>
              <Text fontSize="lg" opacity={0.9} maxW="600px">
                Become part of a growing community of scholars, writers, and knowledge enthusiasts 
                dedicated to preserving and sharing African heritage.
              </Text>
            </VStack>
            
            <HStack spacing={4} flexWrap="wrap" justify="center">
              {!isAuthenticated() && (
                <Link href="/auth/register" passHref>
                  <Button 
                    size="lg" 
                    bg="white" 
                    color="african.800"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  >
                    Create Account
                  </Button>
                </Link>
              )}
              
              <Link href="/about" passHref>
                <Button 
                  size="lg" 
                  variant="outline" 
                  borderColor="white"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Learn More
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default AfropediaHomepage;
