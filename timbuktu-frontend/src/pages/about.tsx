// pages/about.tsx
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Avatar,
  AvatarGroup,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  StarIcon,
} from '@chakra-ui/icons';
import {
  FiBook,
  FiUsers,
  FiAward,
  FiGlobe,
  FiHeart,
  FiTarget,
  FiShield,
} from 'react-icons/fi';

const AboutPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const stats = [
    { icon: FiBook, label: 'Peer-Reviewed Articles', value: 'Quality Content', color: 'african' },
    { icon: FiUsers, label: 'Expert Contributors', value: 'Global Community', color: 'forest' },
    { icon: FiAward, label: 'Academic Standards', value: 'Rigorous Review', color: 'sunset' },
    { icon: FiGlobe, label: 'African Focus', value: '54 Countries', color: 'earth' },
  ];

  const values = [
    {
      icon: FiHeart,
      title: 'Cultural Respect',
      description: 'We celebrate and honor the rich diversity of African cultures, traditions, and perspectives.',
      color: 'sunset'
    },
    {
      icon: FiTarget,
      title: 'Academic Excellence',
      description: 'Every article undergoes rigorous peer review to ensure accuracy and scholarly quality.',
      color: 'african'
    },
    {
      icon: FiShield,
      title: 'Community Driven',
      description: 'Built by Africans and African diaspora scholars, for the global community.',
      color: 'forest'
    },
    {
      icon: FiGlobe,
      title: 'Global Accessibility',
      description: 'Making African knowledge accessible to learners and researchers worldwide.',
      color: 'sky'
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      {/* Header Section */}
      <VStack spacing={8} mb={12} textAlign="center">
        <VStack spacing={4}>
          <Badge colorScheme="african" variant="subtle" px={4} py={2} borderRadius="full">
            🌍 About Afropedia
          </Badge>
          <Heading size="2xl" color="african.900">
            The African Encyclopedia
          </Heading>
          <Text fontSize="xl" color="gray.700" maxW="800px" lineHeight="1.6">
            Afropedia is the premier digital encyclopedia dedicated to preserving, celebrating, 
            and sharing the vast wealth of African knowledge, culture, and heritage through 
            rigorous academic peer review.
          </Text>
        </VStack>
      </VStack>

      {/* Mission Section */}
      <Box mb={16}>
        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6} textAlign="center">
              <Heading size="lg" color="african.900">
                Our Mission
              </Heading>
              <Text fontSize="lg" color="gray.700" lineHeight="1.8" maxW="600px">
                To create the world's most comprehensive and authoritative digital repository 
                of African knowledge, ensuring that the continent's rich intellectual heritage 
                is preserved, accessible, and celebrated for current and future generations.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Stats Section */}
      <Box mb={16}>
        <VStack spacing={8}>
          <Heading size="lg" color="african.900" textAlign="center">
            Why Afropedia Matters
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {stats.map((stat, index) => (
              <Card key={index} bg={cardBg} shadow="md" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.3s">
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Box
                      p={3}
                      bg={`${stat.color}.100`}
                      color={`${stat.color}.600`}
                      borderRadius="full"
                    >
                      <stat.icon size="24px" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontWeight="bold" color="african.900">
                        {stat.label}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {stat.value}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Values Section */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Our Core Values
            </Heading>
            <Text fontSize="lg" color="gray.700" maxW="600px">
              These principles guide everything we do at Afropedia
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
            {values.map((value, index) => (
              <Card key={index} bg={cardBg} shadow="md" h="full">
                <CardBody p={6}>
                  <HStack align="start" spacing={4}>
                    <Box
                      p={3}
                      bg={`${value.color}.100`}
                      color={`${value.color}.600`}
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      <value.icon size="24px" />
                    </Box>
                    <VStack align="start" spacing={3}>
                      <Heading size="md" color="african.900">
                        {value.title}
                      </Heading>
                      <Text color="gray.700" lineHeight="1.6">
                        {value.description}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* How It Works Section */}
      <Box mb={16}>
        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="african.900">
                  How Afropedia Works
                </Heading>
                <Text fontSize="lg" color="gray.700" maxW="600px">
                  Our rigorous process ensures the highest quality content
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                <VStack spacing={4} textAlign="center">
                  <Box
                    p={4}
                    bg="african.100"
                    color="african.600"
                    borderRadius="full"
                  >
                    <FiUsers size="32px" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color="african.900">
                      1. Expert Contributors
                    </Heading>
                    <Text color="gray.700" fontSize="sm">
                      Scholars, researchers, and cultural experts contribute content based on their expertise
                    </Text>
                  </VStack>
                </VStack>

                <VStack spacing={4} textAlign="center">
                  <Box
                    p={4}
                    bg="forest.100"
                    color="forest.600"
                    borderRadius="full"
                  >
                    <FiAward size="32px" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color="african.900">
                      2. Peer Review
                    </Heading>
                    <Text color="gray.700" fontSize="sm">
                      Multiple experts review each article for accuracy, completeness, and scholarly standards
                    </Text>
                  </VStack>
                </VStack>

                <VStack spacing={4} textAlign="center">
                  <Box
                    p={4}
                    bg="sunset.100"
                    color="sunset.600"
                    borderRadius="full"
                  >
                    <FiGlobe size="32px" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color="african.900">
                      3. Global Access
                    </Heading>
                    <Text color="gray.700" fontSize="sm">
                      Approved content becomes available to learners and researchers worldwide
                    </Text>
                  </VStack>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Coverage Areas */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              What We Cover
            </Heading>
            <Text fontSize="lg" color="gray.700" maxW="600px">
              Comprehensive coverage of African knowledge and culture
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {[
              'Ancient Civilizations & History',
              'Traditional & Contemporary Culture',
              'Languages & Literature',
              'Science & Innovation',
              'Politics & Governance',
              'Geography & Environment',
              'Arts & Music',
              'Philosophy & Religion',
              'Economics & Trade',
            ].map((topic, index) => (
              <Card key={index} bg={cardBg} shadow="sm" size="sm">
                <CardBody>
                  <HStack spacing={3}>
                    <CheckCircleIcon color="african.500" />
                    <Text fontWeight="medium" color="african.900">
                      {topic}
                    </Text>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Join Us Section */}
      <Box>
        <Card bg="african.800" color="white" shadow="xl">
          <CardBody p={8} textAlign="center">
            <VStack spacing={6}>
              <VStack spacing={4}>
                <Heading size="lg">
                  Join the Afropedia Community
                </Heading>
                <Text fontSize="lg" maxW="600px" opacity={0.9}>
                  Whether you're a scholar, student, or simply passionate about African knowledge, 
                  there's a place for you in our community.
                </Text>
              </VStack>

              <List spacing={2} textAlign="left">
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="yellow.400" />
                  Contribute articles in your area of expertise
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="yellow.400" />
                  Participate in the peer review process
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="yellow.400" />
                  Help moderate and maintain quality standards
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="yellow.400" />
                  Connect with scholars and researchers globally
                </ListItem>
              </List>

              <Text fontSize="sm" opacity={0.8} maxW="500px">
                Together, we're building the most comprehensive resource for African knowledge 
                and making it accessible to the world.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
};

export default AboutPage;
