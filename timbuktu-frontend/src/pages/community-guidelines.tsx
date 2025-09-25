// pages/community-guidelines.tsx
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Badge,
  List,
  ListItem,
  ListIcon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import {
  FiHeart,
  FiShield,
  FiUsers,
  FiBook,
  FiAward,
  FiFlag,
  FiEye,
  FiMessageCircle,
} from 'react-icons/fi';

const CommunityGuidelinesPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const coreValues = [
    {
      icon: FiHeart,
      title: 'Respect & Dignity',
      description: 'Treat all community members with respect, regardless of background, expertise level, or perspective.',
      color: 'sunset'
    },
    {
      icon: FiShield,
      title: 'Academic Integrity',
      description: 'Maintain the highest standards of scholarly accuracy and cite sources appropriately.',
      color: 'african'
    },
    {
      icon: FiUsers,
      title: 'Collaborative Spirit',
      description: 'Work together constructively to build the best possible resource for African knowledge.',
      color: 'forest'
    },
    {
      icon: FiBook,
      title: 'Cultural Sensitivity',
      description: 'Approach African cultures and traditions with respect, nuance, and cultural awareness.',
      color: 'sky'
    },
  ];

  const contributionGuidelines = [
    {
      category: 'Content Standards',
      icon: FiBook,
      color: 'african',
      items: [
        'All articles must be well-researched and cite reliable sources',
        'Content should be written in a neutral, encyclopedic tone',
        'Original research and personal opinions are not appropriate',
        'Articles should be comprehensive and cover the topic thoroughly',
        'Use clear, accessible language while maintaining academic rigor'
      ]
    },
    {
      category: 'Peer Review Process',
      icon: FiAward,
      color: 'forest',
      items: [
        'All content undergoes peer review before publication',
        'Reviewers should provide constructive, specific feedback',
        'Authors should respond professionally to reviewer comments',
        'Multiple rounds of review may be necessary for complex topics',
        'Final approval requires consensus among qualified reviewers'
      ]
    },
    {
      category: 'Community Interaction',
      icon: FiUsers,
      color: 'sunset',
      items: [
        'Engage in discussions respectfully and professionally',
        'Assume good faith in all interactions with other contributors',
        'Focus on content and ideas, not personal characteristics',
        'Seek consensus through collaborative discussion',
        'Welcome newcomers and help them learn our processes'
      ]
    },
  ];

  const prohibitedContent = [
    'Hate speech, discrimination, or harassment based on race, ethnicity, religion, gender, or other characteristics',
    'Personal attacks, threats, or intimidation of community members',
    'Plagiarism, copyright infringement, or other violations of intellectual property',
    'Misinformation, conspiracy theories, or deliberately false content',
    'Spam, promotional content, or material unrelated to African knowledge and culture',
    'Content that violates privacy or shares personal information without consent',
    'Material that glorifies violence or promotes harmful activities',
  ];

  const reportingProcess = [
    {
      step: 1,
      title: 'Identify the Issue',
      description: 'Clearly identify what guideline violation has occurred and gather relevant information.'
    },
    {
      step: 2,
      title: 'Use Reporting Tools',
      description: 'Use the "Flag" button on content or contact our moderation team directly.'
    },
    {
      step: 3,
      title: 'Provide Details',
      description: 'Include specific information about the violation and why it concerns you.'
    },
    {
      step: 4,
      title: 'Review Process',
      description: 'Our moderation team will review the report and take appropriate action within 48 hours.'
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      {/* Header Section */}
      <VStack spacing={8} mb={12} textAlign="center">
        <VStack spacing={4}>
          <Badge colorScheme="african" variant="subtle" px={4} py={2} borderRadius="full">
            🤝 Community Guidelines
          </Badge>
          <Heading size="2xl" color="african.900">
            Building Afropedia Together
          </Heading>
          <Text fontSize="xl" color="gray.700" maxW="800px" lineHeight="1.6">
            These guidelines help us maintain a respectful, collaborative, and academically rigorous 
            community dedicated to preserving and sharing African knowledge.
          </Text>
        </VStack>
      </VStack>

      {/* Core Values */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Our Core Values
            </Heading>
            <Text color="gray.700" maxW="600px">
              These fundamental principles guide all interactions within the Afropedia community
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
            {coreValues.map((value, index) => (
              <Card key={index} bg={cardBg} shadow="md">
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

      {/* Contribution Guidelines */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Contribution Guidelines
            </Heading>
            <Text color="gray.700" maxW="600px">
              Follow these guidelines to ensure your contributions meet our quality standards
            </Text>
          </VStack>

          <VStack spacing={6} w="full">
            {contributionGuidelines.map((section, index) => (
              <Card key={index} bg={cardBg} shadow="md" w="full">
                <CardHeader>
                  <HStack spacing={4}>
                    <Box
                      p={2}
                      bg={`${section.color}.100`}
                      color={`${section.color}.600`}
                      borderRadius="md"
                    >
                      <section.icon size="20px" />
                    </Box>
                    <Heading size="md" color="african.900">
                      {section.category}
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <List spacing={2}>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex}>
                        <ListIcon as={CheckCircleIcon} color={`${section.color}.500`} />
                        <Text as="span" color="gray.700">{item}</Text>
                      </ListItem>
                    ))}
                  </List>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </VStack>
      </Box>

      {/* Prohibited Content */}
      <Box mb={16}>
        <Card bg="red.50" border="1px solid" borderColor="red.200" shadow="md">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={4} textAlign="center">
                <Box
                  p={3}
                  bg="red.100"
                  color="red.600"
                  borderRadius="full"
                >
                  <FiFlag size="24px" />
                </Box>
                <Heading size="lg" color="red.700">
                  Prohibited Content
                </Heading>
                <Text color="red.600" maxW="600px">
                  The following types of content are not allowed on Afropedia and will result in content removal and potential account restrictions
                </Text>
              </VStack>

              <List spacing={3} w="full" maxW="800px">
                {prohibitedContent.map((item, index) => (
                  <ListItem key={index}>
                    <ListIcon as={WarningIcon} color="red.500" />
                    <Text as="span" color="red.700">{item}</Text>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Reporting Process */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Reporting Violations
            </Heading>
            <Text color="gray.700" maxW="600px">
              Help us maintain community standards by reporting content or behavior that violates our guidelines
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {reportingProcess.map((step, index) => (
              <Card key={index} bg={cardBg} shadow="md">
                <CardBody textAlign="center" p={6}>
                  <VStack spacing={4}>
                    <Box
                      w="50px"
                      h="50px"
                      bg="african.100"
                      color="african.600"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize="lg"
                    >
                      {step.step}
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="sm" color="african.900">
                        {step.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.700" textAlign="center">
                        {step.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Enforcement Actions */}
      <Box mb={16}>
        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={4} textAlign="center">
                <Box
                  p={3}
                  bg="orange.100"
                  color="orange.600"
                  borderRadius="full"
                >
                  <FiEye size="24px" />
                </Box>
                <Heading size="lg" color="african.900">
                  Enforcement Actions
                </Heading>
                <Text color="gray.700" maxW="600px">
                  Violations of community guidelines may result in the following actions, 
                  depending on the severity and frequency of violations
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                <VStack spacing={3} textAlign="center">
                  <Badge colorScheme="yellow" variant="solid" px={3} py={1}>
                    Warning
                  </Badge>
                  <Text fontSize="sm" color="gray.700">
                    First-time or minor violations typically receive a warning and guidance
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Badge colorScheme="orange" variant="solid" px={3} py={1}>
                    Temporary Restriction
                  </Badge>
                  <Text fontSize="sm" color="gray.700">
                    Repeated violations may result in temporary editing or commenting restrictions
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Badge colorScheme="red" variant="solid" px={3} py={1}>
                    Account Suspension
                  </Badge>
                  <Text fontSize="sm" color="gray.700">
                    Serious or repeated violations may result in permanent account suspension
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Contact and Appeals */}
      <Box>
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle color="blue.800">
              Questions or Appeals?
            </AlertTitle>
            <AlertDescription color="blue.700">
              If you have questions about these guidelines or wish to appeal a moderation decision, 
              please contact us at <strong>moderation@afropedia.org</strong>. We're committed to fair and transparent enforcement.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    </Container>
  );
};

export default CommunityGuidelinesPage;
