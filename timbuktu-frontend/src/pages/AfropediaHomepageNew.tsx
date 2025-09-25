// pages/AfropediaHomepageNew.tsx
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
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  SimpleGrid,
  Circle,
  Divider,
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  Avatar,
  AvatarGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Link,
  Image,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  AddIcon,
} from '@chakra-ui/icons';
import { 
  FiBook, 
  FiUsers, 
  FiAward, 
  FiBookOpen, 
  FiGlobe,
  FiCheck,
  FiSearch,
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiMapPin,
  FiClock,
  FiEye
} from 'react-icons/fi';
import NextLink from 'next/link';
import { ArticleSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';

const AfropediaHomepageNew = () => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalBooks: 0
  });

  const bgGradient = useColorModeValue(
    'linear(to-br, african.50, sunset.50, forest.50)',
    'linear(to-br, african.900, sunset.900, forest.900)'
  );

  const heroBg = useColorModeValue(
    'linear(to-br, african.600, sunset.600, forest.600)',
    'linear(to-br, african.700, sunset.700, forest.700)'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real statistics
        const [articlesRes, usersRes, reviewsRes, booksRes] = await Promise.all([
          fetch('http://localhost:8000/articles/'),
          fetch('http://localhost:8000/auth/users/count'),
          fetch('http://localhost:8000/peer-review/'),
          fetch('http://localhost:8000/books/')
        ]);

        const [articlesData, usersData, reviewsData, booksData] = await Promise.all([
          articlesRes.json(),
          usersRes.json(),
          reviewsRes.json(),
          booksRes.json()
        ]);

        setStats({
          totalArticles: Array.isArray(articlesData) ? articlesData.length : 0,
          totalUsers: usersData?.count || 0,
          totalReviews: Array.isArray(reviewsData) ? reviewsData.length : 0,
          totalBooks: Array.isArray(booksData) ? booksData.length : 0
        });

        setArticles(Array.isArray(articlesData) ? articlesData.slice(0, 6) : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const displayStats = [
    { 
      label: 'Articles', 
      value: stats.totalArticles > 0 ? stats.totalArticles.toLocaleString() : '0', 
      icon: FiBook, 
      color: 'african',
      description: 'Peer-reviewed articles'
    },
    { 
      label: 'Scholars', 
      value: stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : '0', 
      icon: FiUsers, 
      color: 'forest',
      description: 'Active contributors'
    },
    { 
      label: 'Reviews', 
      value: stats.totalReviews > 0 ? stats.totalReviews.toLocaleString() : '0', 
      icon: FiAward, 
      color: 'sunset',
      description: 'Academic reviews'
    },
    { 
      label: 'Books', 
      value: stats.totalBooks > 0 ? stats.totalBooks.toLocaleString() : '0', 
      icon: FiBookOpen, 
      color: 'sky',
      description: 'Digital library'
    }
  ];

  const featuredTopics = [
    { name: 'Ancient Civilizations', articles: 342, icon: '🏛️' },
    { name: 'Traditional Medicine', articles: 198, icon: '🌿' },
    { name: 'African Philosophy', articles: 156, icon: '💭' },
    { name: 'Cultural Heritage', articles: 287, icon: '🎭' },
    { name: 'Modern History', articles: 423, icon: '📚' },
    { name: 'Art & Literature', articles: 234, icon: '🎨' }
  ];

  return (
    <Box bg={bgGradient} minH="100vh">
      {/* Epic Hero Section */}
      <Box 
        bg={heroBg} 
        color="white" 
        minH="100vh" 
        position="relative" 
        overflow="hidden"
        display="flex"
        alignItems="center"
      >
        {/* Animated Background Elements */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity={0.1}>
          <Box
            position="absolute"
            top="10%"
            left="10%"
            width="300px"
            height="300px"
            borderRadius="full"
            border="3px solid"
            borderColor="whiteAlpha.300"
            animation="float 6s ease-in-out infinite"
          />
          <Box
            position="absolute"
            top="60%"
            right="15%"
            width="200px"
            height="200px"
            borderRadius="full"
            border="2px solid"
            borderColor="whiteAlpha.200"
            animation="float 8s ease-in-out infinite reverse"
          />
          <Box
            position="absolute"
            bottom="20%"
            left="20%"
            width="150px"
            height="150px"
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.100"
            animation="float 10s ease-in-out infinite"
          />
        </Box>

        <Container maxW="7xl" position="relative" zIndex={2}>
          <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={16} alignItems="center" minH="80vh">
            
            {/* Main Hero Content */}
            <VStack align="start" spacing={12} py={8}>
              {/* Logo Section */}
              <Box 
                transform="scale(1)"
                transition="all 0.3s ease"
                _hover={{ transform: 'scale(1.02)' }}
              >
                <img 
                  src="/afrologo.png" 
                  alt="Afropedia Logo" 
                  width="450" 
                  height="auto"
                  style={{ 
                    filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.5))',
                    maxWidth: '100%'
                  }}
                />
              </Box>

              {/* Mission Statement */}
              <VStack align="start" spacing={8} maxW="700px">
                <HStack spacing={4} flexWrap="wrap">
                  <Badge 
                    colorScheme="yellow" 
                    variant="solid" 
                    px={6} 
                    py={3} 
                    borderRadius="full"
                    fontSize="lg"
                    shadow="xl"
                    fontWeight="bold"
                  >
                    🌍 Academic Excellence
                  </Badge>
                  <Badge 
                    colorScheme="orange" 
                    variant="solid" 
                    px={6} 
                    py={3} 
                    borderRadius="full"
                    fontSize="lg"
                    shadow="xl"
                    fontWeight="bold"
                  >
                    📚 Peer Reviewed
                  </Badge>
                  <Badge 
                    colorScheme="green" 
                    variant="solid" 
                    px={6} 
                    py={3} 
                    borderRadius="full"
                    fontSize="lg"
                    shadow="xl"
                    fontWeight="bold"
                  >
                    🚀 Revolutionary
                  </Badge>
                </HStack>

                <Heading 
                  size="4xl" 
                  fontWeight="900" 
                  lineHeight="1.1"
                  bgGradient="linear(to-r, white, yellow.200, orange.200)"
                  bgClip="text"
                  letterSpacing="-0.02em"
                  textShadow="2xl"
                >
                  The Future of
                  <br />
                  <Text as="span" color="yellow.300" textShadow="2xl">African Knowledge</Text>
                </Heading>

                <Text 
                  fontSize="2xl" 
                  opacity={0.95} 
                  lineHeight="1.7"
                  fontWeight="400"
                  maxW="650px"
                  textShadow="lg"
                >
                  Where <Text as="span" fontWeight="700" color="yellow.200">ancient wisdom</Text> meets <Text as="span" fontWeight="700" color="orange.200">modern scholarship</Text>. 
                  Discover, contribute to, and celebrate the rich tapestry of African heritage through our revolutionary peer-review system.
                </Text>

                {/* Key Features */}
                <VStack align="start" spacing={4} pt={6}>
                  <HStack spacing={4}>
                    <Circle size="12" bg="green.500" shadow="lg">
                      <FiCheck color="white" size="20px" />
                    </Circle>
                    <Text fontSize="xl" fontWeight="600" textShadow="lg">Academic peer-review process</Text>
                  </HStack>
                  <HStack spacing={4}>
                    <Circle size="12" bg="blue.500" shadow="lg">
                      <FiGlobe color="white" size="20px" />
                    </Circle>
                    <Text fontSize="xl" fontWeight="600" textShadow="lg">Collaborative knowledge building</Text>
                  </HStack>
                  <HStack spacing={4}>
                    <Circle size="12" bg="purple.500" shadow="lg">
                      <FiAward color="white" size="20px" />
                    </Circle>
                    <Text fontSize="xl" fontWeight="600" textShadow="lg">Verified African scholarship</Text>
                  </HStack>
                </VStack>
              </VStack>

              {/* Enhanced Search & CTA */}
              <VStack align="start" spacing={8} w="full" maxW="700px">
                <InputGroup size="xl">
                  <Input
                    placeholder="Search 50,000+ years of African wisdom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    bg="whiteAlpha.200"
                    border="3px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="3xl"
                    h="70px"
                    fontSize="xl"
                    _hover={{ borderColor: 'whiteAlpha.400', bg: 'whiteAlpha.250' }}
                    _focus={{ 
                      borderColor: 'yellow.300', 
                      boxShadow: '0 0 0 6px rgba(251, 191, 36, 0.3)',
                      bg: 'whiteAlpha.300'
                    }}
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.700' }}
                    backdropFilter="blur(15px)"
                    shadow="2xl"
                  />
                  <InputRightElement h="70px" w="70px">
                    <IconButton
                      aria-label="Search"
                      icon={<SearchIcon />}
                      onClick={handleSearch}
                      bg="yellow.400"
                      color="gray.800"
                      _hover={{ bg: 'yellow.300', transform: 'scale(1.1)' }}
                      size="lg"
                      borderRadius="2xl"
                      shadow="2xl"
                    />
                  </InputRightElement>
                </InputGroup>
                
                <HStack spacing={8}>
                  <Button
                    size="xl"
                    h="70px"
                    px={12}
                    bg="yellow.400"
                    color="gray.800"
                    _hover={{ 
                      bg: 'yellow.300', 
                      transform: 'translateY(-6px)',
                      shadow: '2xl'
                    }}
                    _active={{ transform: 'translateY(-3px)' }}
                    leftIcon={<AddIcon />}
                    onClick={() => window.location.href = '/edit/new'}
                    transition="all 0.3s"
                    shadow="2xl"
                    borderRadius="3xl"
                    fontSize="xl"
                    fontWeight="bold"
                  >
                    Start Contributing
                  </Button>
                  <Button
                    size="xl"
                    h="70px"
                    px={12}
                    variant="outline"
                    borderColor="whiteAlpha.400"
                    borderWidth="3px"
                    color="white"
                    _hover={{ 
                      borderColor: 'yellow.200', 
                      bg: 'whiteAlpha.200',
                      transform: 'translateY(-6px)',
                      shadow: '2xl'
                    }}
                    _active={{ transform: 'translateY(-3px)' }}
                    leftIcon={<FiBookOpen />}
                    onClick={() => window.location.href = '/library'}
                    transition="all 0.3s"
                    borderRadius="3xl"
                    fontSize="xl"
                    fontWeight="bold"
                    backdropFilter="blur(15px)"
                    shadow="xl"
                  >
                    Explore Library
                  </Button>
                </HStack>
              </VStack>
            </VStack>

            {/* Elegant Stats Sidebar */}
            <VStack spacing={8} h="full" justify="center">
              <Box 
                bg="whiteAlpha.150" 
                backdropFilter="blur(20px)" 
                borderRadius="3xl" 
                p={10}
                border="2px solid"
                borderColor="whiteAlpha.200"
                shadow="2xl"
                w="full"
                maxW="450px"
                position="relative"
                overflow="hidden"
              >
                {/* Decorative gradient overlay */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  h="6px"
                  bgGradient="linear(to-r, yellow.400, orange.400, red.400, purple.400)"
                  borderTopRadius="3xl"
                />
                
                <VStack spacing={10}>
                  <VStack spacing={3}>
                    <Heading size="2xl" textAlign="center" color="yellow.200" textShadow="lg">
                      📊 Live Impact
                    </Heading>
                    <Text fontSize="lg" opacity={0.9} textAlign="center" fontWeight="500">
                      Real-time platform statistics
                    </Text>
                  </VStack>
                  
                  <SimpleGrid columns={2} spacing={10} w="full">
                    {displayStats.map((stat, index) => (
                      <VStack key={index} spacing={4}>
                        <Circle 
                          size="100px" 
                          bg={`${stat.color}.500`} 
                          color="white"
                          shadow="2xl"
                          border="4px solid"
                          borderColor="whiteAlpha.300"
                          position="relative"
                          _hover={{ transform: 'scale(1.05)' }}
                          transition="all 0.3s"
                        >
                          <stat.icon size="40px" />
                        </Circle>
                        <VStack spacing={1}>
                          <Text fontSize="4xl" fontWeight="900" color="white" textShadow="lg">
                            {stat.value}
                          </Text>
                          <Text fontSize="md" opacity={0.9} textAlign="center" fontWeight="700">
                            {stat.label}
                          </Text>
                          <Text fontSize="xs" opacity={0.7} textAlign="center">
                            {stat.description}
                          </Text>
                        </VStack>
                      </VStack>
                    ))}
                  </SimpleGrid>

                  <Divider borderColor="whiteAlpha.300" />
                  
                  <VStack spacing={4}>
                    <Text fontSize="xl" fontWeight="bold" color="yellow.200" textShadow="lg">
                      🚀 Join the Revolution
                    </Text>
                    <Text fontSize="md" opacity={0.9} textAlign="center" lineHeight="1.6">
                      Be part of Africa's digital knowledge revolution
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              {/* Quick Actions */}
              <VStack spacing={6} w="full" maxW="450px">
                <Button
                  w="full"
                  h="60px"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-3px)', shadow: 'xl' }}
                  leftIcon={<FiUsers />}
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                  onClick={() => window.location.href = '/peer-review'}
                  fontSize="lg"
                  fontWeight="bold"
                  transition="all 0.3s"
                >
                  Peer Review Dashboard
                </Button>
                <Button
                  w="full"
                  h="60px"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-3px)', shadow: 'xl' }}
                  leftIcon={<FiSearch />}
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                  onClick={() => window.location.href = '/search'}
                  fontSize="lg"
                  fontWeight="bold"
                  transition="all 0.3s"
                >
                  Advanced Search
                </Button>
              </VStack>
            </VStack>
          </Grid>
        </Container>

        {/* Floating Animation Keyframes */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(180deg); }
          }
        `}</style>
      </Box>

      {/* Featured Topics Section */}
      <Box py={20} bg="african.50">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4}>
              <Heading size="2xl" color="african.900" textAlign="center">
                🌍 Explore African Knowledge
              </Heading>
              <Text fontSize="xl" color="gray.700" textAlign="center" maxW="600px">
                Dive into the diverse realms of African scholarship and heritage
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {featuredTopics.map((topic, index) => (
                <Card 
                  key={index} 
                  cursor="pointer" 
                  _hover={{ transform: 'translateY(-5px)', shadow: '2xl' }}
                  transition="all 0.3s"
                  bg="white"
                  border="2px solid"
                  borderColor="african.200"
                >
                  <CardBody p={8}>
                    <VStack spacing={4}>
                      <Text fontSize="4xl">{topic.icon}</Text>
                      <Heading size="lg" color="african.800" textAlign="center">
                        {topic.name}
                      </Heading>
                      <Text fontSize="lg" color="african.600" fontWeight="bold">
                        {topic.articles} Articles
                      </Text>
                      <Button
                        colorScheme="african"
                        size="sm"
                        variant="outline"
                        _hover={{ bg: 'african.500', color: 'white' }}
                      >
                        Explore Topic
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box bg={heroBg} py={20} color="white">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={6}>
              <Heading size="3xl" textAlign="center" textShadow="lg">
                Ready to Shape Africa's Digital Future?
              </Heading>
              <Text fontSize="2xl" textAlign="center" opacity={0.9} maxW="800px">
                Join thousands of scholars, researchers, and knowledge enthusiasts building the world's premier African encyclopedia
              </Text>
            </VStack>
            
            <HStack spacing={8}>
              <Button
                size="xl"
                h="70px"
                px={12}
                bg="yellow.400"
                color="gray.800"
                _hover={{ bg: 'yellow.300', transform: 'scale(1.05)' }}
                fontSize="xl"
                fontWeight="bold"
                borderRadius="3xl"
                shadow="2xl"
                onClick={() => window.location.href = '/auth/register'}
              >
                Join Afropedia Today
              </Button>
              <Button
                size="xl"
                h="70px"
                px={12}
                variant="outline"
                borderColor="whiteAlpha.500"
                borderWidth="3px"
                color="white"
                _hover={{ bg: 'whiteAlpha.200', borderColor: 'yellow.200' }}
                fontSize="xl"
                fontWeight="bold"
                borderRadius="3xl"
                backdropFilter="blur(10px)"
                onClick={() => window.location.href = '/about'}
              >
                Learn More
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default AfropediaHomepageNew;
