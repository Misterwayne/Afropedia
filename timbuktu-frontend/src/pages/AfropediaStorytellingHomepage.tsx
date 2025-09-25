// pages/AfropediaStorytellingHomepage.tsx
import { useEffect, useState, useRef } from 'react';
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
  InputLeftElement,
  InputRightElement,
  IconButton,
  SimpleGrid,
  Circle,
  Divider,
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  Progress,
  usePrefersReducedMotion,
  Image,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
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
  FiEye,
  FiArrowDown,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import { ArticleSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeInDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AfropediaStorytellingHomepage = () => {
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalBooks: 0
  });

  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Story sections for interactive storytelling
  const storySteps = [
    {
      title: "Ancient Wisdom",
      subtitle: "50,000+ Years of Knowledge",
      description: "From the cradle of civilization to modern scholarship",
      icon: "🏛️",
      color: "orange.400",
      bgGradient: "linear(to-br, orange.600, red.600)"
    },
    {
      title: "Living Heritage", 
      subtitle: "Vibrant Cultural Legacy",
      description: "Traditions, languages, and customs that shape our world",
      icon: "🎭",
      color: "purple.400",
      bgGradient: "linear(to-br, purple.600, pink.600)"
    },
    {
      title: "Modern Innovation",
      subtitle: "Contemporary African Excellence", 
      description: "Today's breakthroughs in science, technology, and arts",
      icon: "🚀",
      color: "blue.400",
      bgGradient: "linear(to-br, blue.600, cyan.600)"
    },
    {
      title: "Future Vision",
      subtitle: "Digital Knowledge Revolution",
      description: "Building tomorrow's encyclopedia with peer review excellence",
      icon: "🌟",
      color: "yellow.400",
      bgGradient: "linear(to-br, yellow.600, orange.500)"
    }
  ];

  const bgGradient = useColorModeValue(
    'linear(to-br, african.50, sunset.50)',
    'linear(to-br, african.900, sunset.900)'
  );

  const heroSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl', xl: '4xl' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Auto-advance story every 4 seconds
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % storySteps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, prefersReducedMotion, storySteps.length]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const currentStoryData = storySteps[currentStory];

  return (
    <Box bg={bgGradient} minH="100vh" position="relative">
      {/* Scroll Progress Bar */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        h="4px"
        bg="whiteAlpha.200"
        zIndex={1000}
      >
        <Box
          h="full"
          bg="yellow.400"
          transition="width 0.3s ease"
          width={`${scrollProgress * 100}%`}
        />
      </Box>

      {/* Epic Hero Section with Interactive Storytelling */}
      <Box 
        minH="100vh" 
        position="relative" 
        overflow="hidden"
        display="flex"
        alignItems="center"
        bg={currentStoryData.bgGradient}
        transition="all 1s ease-in-out"
      >
        {/* Dynamic Background Elements */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity={0.1}>
          {!prefersReducedMotion && (
            <>
              <Box
                position="absolute"
                top="10%"
                left="10%"
                width="400px"
                height="400px"
                borderRadius="full"
                border="3px solid"
                borderColor="african.900"
                animation={`${float} 8s ease-in-out infinite`}
              />
              <Box
                position="absolute"
                top="50%"
                right="10%"
                width="300px"
                height="300px"
                borderRadius="full"
                border="2px solid"
                borderColor="whiteAlpha.300"
                animation={`${float} 12s ease-in-out infinite reverse`}
              />
              <Box
                position="absolute"
                bottom="20%"
                left="30%"
                width="200px"
                height="200px"
                borderRadius="full"
                border="1px solid"
                borderColor="whiteAlpha.200"
                animation={`${pulse} 6s ease-in-out infinite`}
              />
            </>
          )}
        </Box>

        <Container maxW="7xl" position="relative" zIndex={2} ref={containerRef}>
          {/* Top Section - Logo and Search */}
          <VStack spacing={16} py={12} align="center">
            {/* Logo with Entrance Animation */}
            <Box 
              data-animate="logo"
              id="logo"
              animation={visibleElements.has('logo') && !prefersReducedMotion ? `${fadeInUp} 1s ease-out` : undefined}
              transform={!visibleElements.has('logo') ? 'translateY(50px)' : 'translateY(0)'}
              opacity={!visibleElements.has('logo') ? 0 : 1}
              transition="all 0.8s ease-out"
              textAlign="center"
            >
              <img 
                src="/afrologo.png" 
                alt="Afropedia Logo" 
                width="450" 
                height="auto"
                style={{ 
                  filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.6))',
                  maxWidth: '100%'
                }}
              />
            </Box>

            {/* Enhanced Search Bar */}
            <Box 
              w="full" 
              maxW="900px"
              data-animate="search"
              id="search"
              animation={visibleElements.has('search') && !prefersReducedMotion ? `${fadeInUp} 1s ease-out 0.3s both` : undefined}
              position="relative"
            >
              {/* Advanced Search Container */}
              <Box
                position="relative"
                w="full"
                h="100px"
                bg="linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"
                borderRadius="50px"
                border="2px solid"
                borderColor="whiteAlpha.300"
                backdropFilter="blur(30px)"
                shadow="0 25px 50px rgba(0,0,0,0.25)"
                _hover={{
                  borderColor: 'whiteAlpha.500',
                  shadow: '0 35px 70px rgba(0,0,0,0.35)',
                  transform: 'translateY(-2px)'
                }}
                _focusWithin={{
                  borderColor: 'yellow.300',
                  boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.2), 0 35px 70px rgba(0,0,0,0.35)',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                overflow="hidden"
              >
                {/* Animated Background Gradient */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bg="linear-gradient(45deg, rgba(251,191,36,0.1) 0%, rgba(255,255,255,0.1) 50%, rgba(251,191,36,0.1) 100%)"
                  backgroundSize="200% 200%"
                  animation="gradientShift 3s ease infinite"
                  opacity="0.6"
                />
                
                {/* Search Input */}
                <InputGroup h="100px" size="lg">
                  <InputLeftElement h="100px" pl="8" w="auto">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="3"
                    >
                      <SearchIcon 
                        color="whiteAlpha.700" 
                        boxSize="6" 
                        transition="all 0.3s"
                        _groupFocus={{ color: 'yellow.300', transform: 'scale(1.1)' }}
                      />
                      <Box
                        h="6"
                        w="1px"
                        bg="whiteAlpha.400"
                        _groupFocus={{ bg: 'yellow.300' }}
                        transition="all 0.3s"
                      />
                    </Box>
                  </InputLeftElement>
                  
                  <Input
                    placeholder="Discover 50,000+ years of African wisdom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    bg="transparent"
                    border="none"
                    h="100px"
                    fontSize="xl"
                    fontWeight="500"
                    color="white"
                    _placeholder={{ 
                      color: 'whiteAlpha.700',
                      fontWeight: '400',
                      transition: 'all 0.3s'
                    }}
                    _focus={{
                      _placeholder: { color: 'whiteAlpha.500' },
                      boxShadow: 'none',
                      border: 'none'
                    }}
                    pl="20"
                    pr="32"
                    _hover={{
                      _placeholder: { color: 'whiteAlpha.600' }
                    }}
                  />
                  
                  <InputRightElement h="100px" pr="4" w="auto">
                    <HStack spacing="3">
                      {/* Search Suggestions Indicator */}
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="1"
                        opacity="0.7"
                        _groupFocus={{ opacity: '1' }}
                        transition="opacity 0.3s"
                      >
                        <Box
                          w="2"
                          h="2"
                          bg="yellow.300"
                          borderRadius="full"
                          animation="pulse 2s infinite"
                        />
                        <Text
                          fontSize="sm"
                          color="whiteAlpha.600"
                          fontWeight="500"
                          _groupFocus={{ color: 'yellow.200' }}
                          transition="color 0.3s"
                        >
                          AI Powered
                        </Text>
                      </Box>
                      
                      {/* Search Button */}
                      <IconButton
                        aria-label="Search"
                        icon={<SearchIcon />}
                        onClick={handleSearch}
                        bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                        color="white"
                        _hover={{ 
                          bg: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                          transform: 'scale(1.05)',
                          shadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
                        }}
                        _active={{
                          transform: 'scale(0.95)'
                        }}
                        size="lg"
                        borderRadius="full"
                        shadow="0 8px 20px rgba(245, 158, 11, 0.3)"
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        w="60px"
                        h="60px"
                      />
                    </HStack>
                  </InputRightElement>
                </InputGroup>
                
                {/* Floating Search Tips */}
                <Box
                  position="absolute"
                  bottom="-40px"
                  left="50%"
                  transform="translateX(-50%)"
                  display="flex"
                  gap="4"
                  opacity="0.8"
                  _groupFocus={{ opacity: '1' }}
                  transition="opacity 0.3s"
                >
                  <Text fontSize="sm" color="whiteAlpha.600">
                    Try: "Ancient Timbuktu" • "Nubian Kingdoms" • "African Art"
                  </Text>
                </Box>
              </Box>
              
              {/* Search Results Preview (when typing) */}
              {searchQuery && (
                <Box
                  position="absolute"
                  top="120px"
                  left="0"
                  right="0"
                  bg="rgba(255,255,255,0.95)"
                  backdropFilter="blur(20px)"
                  borderRadius="20px"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  shadow="0 20px 40px rgba(0,0,0,0.1)"
                  p="6"
                  zIndex="10"
                  animation="fadeInDown 0.3s ease-out"
                >
                  <Text color="gray.600" fontSize="sm" mb="3">
                    Press Enter to search for "{searchQuery}"
                  </Text>
                  <HStack spacing="2" flexWrap="wrap">
                    <Badge colorScheme="yellow" variant="subtle">Articles</Badge>
                    <Badge colorScheme="blue" variant="subtle">Books</Badge>
                    <Badge colorScheme="green" variant="subtle">Media</Badge>
                  </HStack>
                </Box>
              )}
            </Box>
          </VStack>

          {/* Main Content Grid */}
          <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={20} alignItems="start" py={20}>
            
            {/* Main Storytelling Content */}
            <VStack align="start" spacing={20} py={8}>

              {/* Interactive Story Section */}
              <VStack align="start" spacing={12} maxW="800px" w="full">
                {/* Story Controls */}
                <HStack spacing={6}>
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="ghost"
                    color="white"
                    leftIcon={isPlaying ? <FiPause /> : <FiPlay />}
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    {isPlaying ? 'Pause Story' : 'Play Story'}
                  </Button>
                  <HStack spacing={2}>
                    {storySteps.map((_, index) => (
                      <Circle
                        key={index}
                        size="12px"
                        bg={index === currentStory ? 'white' : 'whiteAlpha.400'}
                        cursor="pointer"
                        onClick={() => setCurrentStory(index)}
                        transition="all 0.3s"
                        _hover={{ transform: 'scale(1.2)' }}
                      />
                    ))}
                  </HStack>
                </HStack>

                {/* Dynamic Story Content */}
                <VStack align="start" spacing={8} key={currentStory}>
                  <HStack spacing={6}>
                    <Text fontSize="6xl" animation={!prefersReducedMotion ? `${pulse} 2s ease-in-out infinite` : undefined}>
                      {currentStoryData.icon}
                    </Text>
                    <VStack align="start" spacing={2}>
                      <Heading 
                        size={heroSize}
                        fontWeight="900" 
                        color="white"
                        textShadow="2xl"
                        animation={!prefersReducedMotion ? `${fadeInUp} 0.8s ease-out` : undefined}
                      >
                        {currentStoryData.title}
                      </Heading>
                      <Text 
                        fontSize="2xl" 
                        color="whiteAlpha.900"
                        fontWeight="600"
                        animation={!prefersReducedMotion ? `${fadeInUp} 0.8s ease-out 0.2s both` : undefined}
                      >
                        {currentStoryData.subtitle}
                      </Text>
                    </VStack>
                  </HStack>

                  <Text 
                    fontSize="xl" 
                    color="whiteAlpha.900"
                    lineHeight="1.8"
                    maxW="600px"
                    animation={!prefersReducedMotion ? `${fadeInUp} 0.8s ease-out 0.4s both` : undefined}
                  >
                    {currentStoryData.description}
                  </Text>

                  {/* Progress Bar for Current Story */}
                  <Box w="full" maxW="400px">
                    <Progress
                      value={isPlaying ? ((currentStory + 1) / storySteps.length) * 100 : 0}
                      colorScheme="yellow"
                      bg="whiteAlpha.200"
                      borderRadius="full"
                      size="lg"
                      transition="all 0.3s ease"
                    />
                  </Box>
                </VStack>

                {/* Enhanced Mission Statement */}
                <VStack align="start" spacing={8} pt={12} w="full">
                  <Heading 
                    size="2xl" 
                    color="white"
                    textShadow="xl"
                    data-animate="mission"
                    id="mission"
                    animation={visibleElements.has('mission') && !prefersReducedMotion ? `${slideInRight} 1s ease-out` : undefined}
                  >
                    The Future of African Knowledge
                  </Heading>
                  
                  <Text 
                    fontSize="xl" 
                    color="whiteAlpha.900"
                    lineHeight="1.7"
                    maxW="700px"
                  >
                    Where <Text as="span" fontWeight="800" color="yellow.200">ancient wisdom</Text> meets 
                    <Text as="span" fontWeight="800" color="orange.200"> modern scholarship</Text>. 
                    Join our revolutionary peer-review system and help build the world's most comprehensive African encyclopedia.
                  </Text>

                  {/* Interactive Features List */}
                  <VStack align="start" spacing={6} pt={8}>
                    {[
                      { icon: FiCheck, text: "Academic peer-review process", color: "green.400" },
                      { icon: FiGlobe, text: "Collaborative knowledge building", color: "blue.400" },
                      { icon: FiAward, text: "Verified African scholarship", color: "purple.400" }
                    ].map((feature, index) => (
                      <HStack 
                        key={index}
                        spacing={4}
                        data-animate={`feature-${index}`}
                        id={`feature-${index}`}
                        animation={visibleElements.has(`feature-${index}`) && !prefersReducedMotion 
                          ? `${fadeInUp} 0.6s ease-out ${index * 0.2}s both` : undefined}
                      >
                        <Circle size="16" bg={feature.color} shadow="xl">
                          <feature.icon color="white" size="24px" />
                        </Circle>
                        <Text fontSize="xl" fontWeight="600" color="white" textShadow="lg">
                          {feature.text}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </VStack>

              {/* CTA Buttons */}
              <VStack align="center" spacing={8} w="full" maxW="800px" pt={8}>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={8} w="full">
                  <Button
                    size="xl"
                    h="80px"
                    px={16}
                    bg="yellow.400"
                    color="gray.800"
                    _hover={{ 
                      bg: 'yellow.300', 
                      transform: 'translateY(-8px)',
                      shadow: '2xl'
                    }}
                    _active={{ transform: 'translateY(-4px)' }}
                    leftIcon={<AddIcon />}
                    onClick={() => window.location.href = '/edit/new'}
                    transition="all 0.4s"
                    shadow="2xl"
                    borderRadius="3xl"
                    fontSize="xl"
                    fontWeight="bold"
                    flex={1}
                  >
                    Start Contributing
                  </Button>
                  <Button
                    size="xl"
                    h="80px"
                    px={16}
                    variant="outline"
                    borderColor="whiteAlpha.500"
                    borderWidth="3px"
                    color="white"
                    _hover={{ 
                      borderColor: 'yellow.200', 
                      bg: 'whiteAlpha.200',
                      transform: 'translateY(-8px)',
                      shadow: '2xl'
                    }}
                    _active={{ transform: 'translateY(-4px)' }}
                    leftIcon={<FiBookOpen />}
                    onClick={() => window.location.href = '/library'}
                    transition="all 0.4s"
                    borderRadius="3xl"
                    fontSize="xl"
                    fontWeight="bold"
                    backdropFilter="blur(20px)"
                    shadow="xl"
                    flex={1}
                  >
                    Explore Library
                  </Button>
                </Stack>
              </VStack>
            </VStack>

            {/* Floating Stats Dashboard */}
            <VStack spacing={8} h="full" justify="center">
              <Box 
                bg="whiteAlpha.150" 
                backdropFilter="blur(25px)" 
                borderRadius="4xl" 
                p={12}
                border="3px solid"
                borderColor="whiteAlpha.300"
                shadow="2xl"
                w="full"
                maxW="500px"
                position="relative"
                overflow="hidden"
                data-animate="stats"
                id="stats"
                animation={visibleElements.has('stats') && !prefersReducedMotion ? `${slideInRight} 1.2s ease-out` : undefined}
              >
                {/* Animated Gradient Border */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  h="8px"
                  bgGradient="linear(to-r, yellow.400, orange.400, red.400, purple.400, blue.400)"
                  borderTopRadius="4xl"
                  animation={!prefersReducedMotion ? `${pulse} 3s ease-in-out infinite` : undefined}
                />
                
                <VStack spacing={12}>
                  <VStack spacing={4}>
                    <Heading size="2xl" textAlign="center" color="white" textShadow="xl">
                      📊 Live Impact
                    </Heading>
                    <Text fontSize="lg" color="whiteAlpha.900" textAlign="center" fontWeight="600">
                      Real-time platform statistics
                    </Text>
                  </VStack>
                  
                  <SimpleGrid columns={2} spacing={12} w="full">
                    {[
                      { label: 'Articles', value: stats.totalArticles, icon: FiBook, color: 'african' },
                      { label: 'Scholars', value: stats.totalUsers, icon: FiUsers, color: 'forest' },
                      { label: 'Reviews', value: stats.totalReviews, icon: FiAward, color: 'sunset' },
                      { label: 'Books', value: stats.totalBooks, icon: FiBookOpen, color: 'sky' }
                    ].map((stat, index) => (
                      <VStack key={index} spacing={4}>
                        <Circle 
                          size="120px" 
                          bg={`${stat.color}.500`} 
                          color="white"
                          shadow="2xl"
                          border="4px solid"
                          borderColor="whiteAlpha.400"
                          _hover={{ transform: 'scale(1.1)' }}
                          transition="all 0.4s"
                          animation={!prefersReducedMotion ? `${pulse} ${4 + index}s ease-in-out infinite` : undefined}
                        >
                          <stat.icon size="48px" />
                        </Circle>
                        <VStack spacing={1}>
                          <Text fontSize="4xl" fontWeight="900" color="white" textShadow="lg">
                            {stat.value > 0 ? stat.value.toLocaleString() : '0'}
                          </Text>
                          <Text fontSize="lg" color="whiteAlpha.900" textAlign="center" fontWeight="700">
                            {stat.label}
                          </Text>
                        </VStack>
                      </VStack>
                    ))}
                  </SimpleGrid>

                  <Divider borderColor="whiteAlpha.400" />
                  
                  <VStack spacing={4}>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.200" textShadow="lg">
                      🚀 Join the Revolution
                    </Text>
                    <Text fontSize="lg" color="whiteAlpha.900" textAlign="center" lineHeight="1.8">
                      Be part of Africa's digital knowledge revolution
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <Box
          position="absolute"
          bottom="8"
          left="50%"
          transform="translateX(-50%)"
          color="white"
          animation={!prefersReducedMotion ? `${fadeInUp} 2s ease-out 2s both` : undefined}
        >
          <VStack spacing={2}>
            <Text fontSize="sm" opacity={0.8}>Scroll to explore</Text>
            <FiArrowDown size="24px" style={{ 
              animation: !prefersReducedMotion ? `${float} 2s ease-in-out infinite` : undefined 
            }} />
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default AfropediaStorytellingHomepage;
