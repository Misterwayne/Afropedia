// pages/AfropediaSectionedHomepage.tsx
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
  FiPause,
  FiChevronDown
} from 'react-icons/fi';
import { ArticleSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';
import EnhancedSearchInput from '@/components/Search/EnhancedSearchInput';
import apiClient from '@/lib/api';

// Enhanced keyframe animations
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
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const AfropediaSectionedHomepage = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalBooks: 0
  });

  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Story sections for the homepage
  const sections = [
    {
      id: 'hero',
      title: 'Welcome to Afropedia',
      subtitle: 'The Future of African Knowledge',
      description: 'Where ancient wisdom meets modern scholarship',
      bgGradient: 'linear(to-br, african.600, sunset.600)',
      content: 'hero'
    },
    {
      id: 'heritage',
      title: 'Ancient Wisdom',
      subtitle: '50,000+ Years of Knowledge',
      description: 'From the cradle of civilization to the libraries of Timbuktu',
      bgGradient: 'linear(to-br, orange.600, red.600)',
      content: 'heritage'
    },
    {
      id: 'modern',
      title: 'Living Heritage',
      subtitle: 'Vibrant Cultural Legacy',
      description: 'Traditions, languages, and customs that shape our world today',
      bgGradient: 'linear(to-br, purple.600, pink.600)',
      content: 'modern'
    },
    {
      id: 'future',
      title: 'Digital Revolution',
      subtitle: 'Peer-Reviewed Excellence',
      description: 'Building tomorrow\'s encyclopedia with academic rigor',
      bgGradient: 'linear(to-br, blue.600, cyan.600)',
      content: 'future'
    },
    {
      id: 'join',
      title: 'Join the Movement',
      subtitle: 'Be Part of History',
      description: 'Contribute to Africa\'s digital knowledge revolution',
      bgGradient: 'linear(to-br, green.600, teal.600)',
      content: 'join'
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch articles and books using apiClient
        const [articlesRes, booksRes] = await Promise.all([
          apiClient.get('/articles/'),
          apiClient.get('/books/')
        ]);

        // Set stats with available data
        setStats({
          totalArticles: Array.isArray(articlesRes.data) ? articlesRes.data.length : 0,
          totalUsers: 0, // Will be implemented later when user count endpoint exists
          totalReviews: 0, // Will be implemented later when peer review stats endpoint exists
          totalBooks: Array.isArray(booksRes.data) ? booksRes.data.length : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values on error
        setStats({
          totalArticles: 0,
          totalUsers: 0,
          totalReviews: 0,
          totalBooks: 0
        });
      }
    };

    fetchStats();
  }, []);

  // Intersection Observer to track current section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = sectionRefs.current.findIndex(ref => ref === entry.target);
            if (sectionIndex !== -1) {
              setCurrentSection(sectionIndex);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderHeroSection = () => (
    <VStack spacing={16} align="center" justify="center" h="full" textAlign="center">
      {/* Logo */}
      <Box 
        animation={!prefersReducedMotion ? `${fadeInDown} 1s ease-out` : undefined}
      >
        <img 
          src="/afrologo.png" 
          alt="Afropedia Logo" 
          width="500" 
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
        animation={!prefersReducedMotion ? `${fadeInUp} 1s ease-out 0.3s both` : undefined}
      >
        <EnhancedSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Discover 50,000+ years of African wisdom..."
          size="xl"
        />
      </Box>

      {/* Scroll Indicator */}
      <VStack 
        spacing={3} 
        animation={!prefersReducedMotion ? `${fadeInUp} 1s ease-out 1s both` : undefined}
        cursor="pointer"
        onClick={() => scrollToSection(1)}
        _hover={{ transform: 'translateY(-5px)' }}
        transition="all 0.3s"
      >
        <Text fontSize="lg" opacity={0.9}>Scroll to explore our story</Text>
        <FiChevronDown size="32px" style={{ 
          animation: !prefersReducedMotion ? `${float} 2s ease-in-out infinite` : undefined 
        }} />
      </VStack>
    </VStack>
  );

  const renderHeritageSection = () => (
    <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={16} alignItems="center" h="full">
      <VStack align="start" spacing={8}>
        <Text fontSize="8xl" animation={!prefersReducedMotion ? `${pulse} 3s ease-in-out infinite` : undefined}>
          🏛️
        </Text>
        <VStack align="start" spacing={6}>
          <Heading size="4xl" color="white" textShadow="xl">
            Ancient Wisdom
          </Heading>
          <Text fontSize="2xl" color="whiteAlpha.900" lineHeight="1.7">
            From the Great Library of Alexandria to the manuscripts of Timbuktu, 
            Africa has been the guardian of human knowledge for millennia.
          </Text>
          <VStack align="start" spacing={4} pt={6}>
            {[
              "📚 Ancient manuscripts and texts",
              "🔬 Mathematical and scientific discoveries", 
              "🎭 Oral traditions and storytelling",
              "🏛️ Philosophical schools of thought"
            ].map((item, index) => (
              <Text key={index} fontSize="xl" color="whiteAlpha.900">
                {item}
              </Text>
            ))}
          </VStack>
        </VStack>
      </VStack>
      
      <Box 
        bg="whiteAlpha.150" 
        backdropFilter="blur(20px)" 
        borderRadius="3xl" 
        p={8}
        border="2px solid"
        borderColor="whiteAlpha.300"
        shadow="2xl"
      >
        <VStack spacing={6}>
          <Heading size="xl" color="white" textAlign="center">
            📊 Knowledge Repository
          </Heading>
          <SimpleGrid columns={2} spacing={6} w="full">
            <VStack spacing={3}>
              <Circle size="80px" bg="orange.500" color="white" shadow="xl">
                <FiBook size="32px" />
              </Circle>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {stats.totalArticles.toLocaleString()}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.900">Articles</Text>
            </VStack>
            <VStack spacing={3}>
              <Circle size="80px" bg="red.500" color="white" shadow="xl">
                <FiBookOpen size="32px" />
              </Circle>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {stats.totalBooks.toLocaleString()}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.900">Books</Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>
    </Grid>
  );

  const renderModernSection = () => (
    <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={16} alignItems="center" h="full">
      <Box 
        bg="whiteAlpha.150" 
        backdropFilter="blur(20px)" 
        borderRadius="3xl" 
        p={8}
        border="2px solid"
        borderColor="whiteAlpha.300"
        shadow="2xl"
      >
        <VStack spacing={6}>
          <Text fontSize="6xl">🎭</Text>
          <Heading size="xl" color="white" textAlign="center">
            Living Traditions
          </Heading>
          <VStack spacing={4}>
            <Text fontSize="lg" color="whiteAlpha.900" textAlign="center" lineHeight="1.6">
              Africa is home to incredible diversity of languages, cultures, and art forms 
              that continue to shape our world today.
            </Text>
            <SimpleGrid columns={2} spacing={4} w="full">
              <VStack spacing={2}>
                <Text fontSize="3xl">📚</Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {stats.totalArticles.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.900">Cultural Articles</Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="3xl">👥</Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {stats.totalUsers.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.900">Contributors</Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </VStack>
      </Box>

      <VStack align="start" spacing={8}>
        <VStack align="start" spacing={6}>
          <Heading size="4xl" color="white" textShadow="xl">
            Living Heritage
          </Heading>
          <Text fontSize="2xl" color="whiteAlpha.900" lineHeight="1.7">
            African culture continues to evolve and influence the world. 
            From music and art to philosophy and innovation, our heritage lives on.
          </Text>
          <VStack align="start" spacing={4} pt={6}>
            {[
              { icon: FiHeart, text: "Cultural preservation initiatives", color: "pink.400" },
              { icon: FiGlobe, text: "Global African diaspora connections", color: "purple.400" },
              { icon: FiStar, text: "Contemporary African excellence", color: "blue.400" }
            ].map((feature, index) => (
              <HStack key={index} spacing={4}>
                <Circle size="12" bg={feature.color} shadow="lg">
                  <feature.icon color="white" size="20px" />
                </Circle>
                <Text fontSize="xl" fontWeight="600" color="white">
                  {feature.text}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </VStack>
    </Grid>
  );

  const renderFutureSection = () => (
    <VStack spacing={16} align="center" justify="center" h="full" textAlign="center">
      <VStack spacing={8}>
        <Text fontSize="8xl" animation={!prefersReducedMotion ? `${pulse} 3s ease-in-out infinite` : undefined}>
          🚀
        </Text>
        <Heading size="4xl" color="white" textShadow="xl">
          Digital Revolution
        </Heading>
        <Text fontSize="2xl" color="whiteAlpha.900" maxW="800px" lineHeight="1.7">
          We're building the world's most comprehensive African encyclopedia 
          with cutting-edge peer-review technology and academic excellence.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full" maxW="900px">
        {[
          { icon: FiCheck, title: "Peer Review", desc: "Academic validation", color: "green.500" },
          { icon: FiUsers, title: "Community", desc: "Global collaboration", color: "blue.500" },
          { icon: FiAward, title: "Excellence", desc: "Quality assurance", color: "purple.500" }
        ].map((feature, index) => (
          <Card key={index} bg="whiteAlpha.200" backdropFilter="blur(20px)" border="2px solid" borderColor="whiteAlpha.300">
            <CardBody p={8} textAlign="center">
              <VStack spacing={4}>
                <Circle size="80px" bg={feature.color} color="white" shadow="xl">
                  <feature.icon size="32px" />
                </Circle>
                <Heading size="lg" color="white">
                  {feature.title}
                </Heading>
                <Text color="whiteAlpha.900">
                  {feature.desc}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <VStack spacing={6}>
        <Text fontSize="xl" color="whiteAlpha.900">
          Join {stats.totalUsers.toLocaleString()} scholars already contributing
        </Text>
        <Progress 
          value={Math.min((stats.totalUsers / 10000) * 100, 100)} 
          colorScheme="cyan" 
          bg="whiteAlpha.200" 
          borderRadius="full" 
          size="lg" 
          w="400px" 
        />
      </VStack>
    </VStack>
  );

  const renderJoinSection = () => (
    <VStack spacing={16} align="center" justify="center" h="full" textAlign="center">
      <VStack spacing={8}>
        <Text fontSize="8xl" animation={!prefersReducedMotion ? `${pulse} 3s ease-in-out infinite` : undefined}>
          🌟
        </Text>
        <Heading size="4xl" color="white" textShadow="xl">
          Ready to Make History?
        </Heading>
        <Text fontSize="2xl" color="whiteAlpha.900" maxW="800px" lineHeight="1.7">
          Join thousands of scholars, researchers, and knowledge enthusiasts 
          building the future of African knowledge.
        </Text>
      </VStack>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
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
          leftIcon={<AddIcon />}
          onClick={() => window.location.href = '/edit/new'}
          transition="all 0.4s"
          shadow="2xl"
          borderRadius="3xl"
          fontSize="xl"
          fontWeight="bold"
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
          leftIcon={<FiBookOpen />}
          onClick={() => window.location.href = '/library'}
          transition="all 0.4s"
          borderRadius="3xl"
          fontSize="xl"
          fontWeight="bold"
          backdropFilter="blur(20px)"
          shadow="xl"
        >
          Explore Library
        </Button>
      </Stack>

      <VStack spacing={4}>
        <Text fontSize="lg" color="whiteAlpha.900">
          Or explore more ways to get involved
        </Text>
        <HStack spacing={6}>
          <Button variant="ghost" color="white" onClick={() => window.location.href = '/peer-review'}>
            Peer Review
          </Button>
          <Button variant="ghost" color="white" onClick={() => window.location.href = '/about'}>
            Learn More
          </Button>
          <Button variant="ghost" color="white" onClick={() => window.location.href = '/auth/register'}>
            Join Community
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );

  return (
    <Box position="relative">
      {/* Section Navigation Dots */}
      <Box
        position="fixed"
        right="8"
        top="50%"
        transform="translateY(-50%)"
        zIndex={1000}
        bg="whiteAlpha.200"
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        p={4}
      >
        <VStack spacing={3}>
          {sections.map((_, index) => (
            <Circle
              key={index}
              size="12px"
              bg={index === currentSection ? 'yellow.400' : 'whiteAlpha.500'}
              cursor="pointer"
              onClick={() => scrollToSection(index)}
              transition="all 0.3s"
              _hover={{ transform: 'scale(1.3)', bg: 'yellow.300' }}
            />
          ))}
        </VStack>
      </Box>

      {/* Sections */}
      {sections.map((section, index) => (
        <Box
          key={section.id}
          ref={(el) => {
            sectionRefs.current[index] = el;
          }}
          minH="80vh"
          bg={section.bgGradient}
          color="white"
          position="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          py={20}
        >
          {/* Animated Background Elements */}
          <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity={0.1}>
            {!prefersReducedMotion && (
              <>
                <Box
                  position="absolute"
                  top={`${10 + (index * 5)}%`}
                  left={`${10 + (index * 3)}%`}
                  width="300px"
                  height="300px"
                  borderRadius="full"
                  border="3px solid"
                  borderColor="whiteAlpha.400"
                  animation={`${float} ${8 + index}s ease-in-out infinite`}
                />
                <Box
                  position="absolute"
                  top={`${60 + (index * 2)}%`}
                  right={`${15 + (index * 2)}%`}
                  width="200px"
                  height="200px"
                  borderRadius="full"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                  animation={`${float} ${10 + index}s ease-in-out infinite reverse`}
                />
              </>
            )}
          </Box>

          <Container maxW="7xl" position="relative" zIndex={2}>
            {section.content === 'hero' && renderHeroSection()}
            {section.content === 'heritage' && renderHeritageSection()}
            {section.content === 'modern' && renderModernSection()}
            {section.content === 'future' && renderFutureSection()}
            {section.content === 'join' && renderJoinSection()}
          </Container>
        </Box>
      ))}
    </Box>
  );
};

export default AfropediaSectionedHomepage;
