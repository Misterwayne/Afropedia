// pages/privacy.tsx
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
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  InfoIcon,
  LockIcon,
} from '@chakra-ui/icons';
import {
  FiShield,
  FiEye,
  FiDatabase,
  FiUsers,
  FiSettings,
  FiMail,
  FiClock,
  FiTrash2,
} from 'react-icons/fi';

const PrivacyPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const dataTypes = [
    {
      category: 'Account Information',
      icon: FiUsers,
      color: 'african',
      items: [
        'Username and email address',
        'Profile information you choose to provide',
        'Account preferences and settings',
        'Authentication credentials (securely hashed)'
      ]
    },
    {
      category: 'Content & Contributions',
      icon: FiDatabase,
      color: 'forest',
      items: [
        'Articles, edits, and other content you create',
        'Comments and discussion posts',
        'Peer review feedback and ratings',
        'Upload timestamps and revision history'
      ]
    },
    {
      category: 'Usage Information',
      icon: FiEye,
      color: 'sunset',
      items: [
        'Pages visited and features used',
        'Search queries and browsing patterns',
        'Device and browser information',
        'IP address and general location'
      ]
    },
  ];

  const dataUses = [
    {
      purpose: 'Service Operation',
      description: 'Provide and maintain Afropedia\'s core functionality',
      examples: ['User authentication', 'Content display', 'Search functionality']
    },
    {
      purpose: 'Quality Assurance',
      description: 'Maintain content quality and prevent abuse',
      examples: ['Peer review process', 'Spam detection', 'Community moderation']
    },
    {
      purpose: 'Communication',
      description: 'Send important updates and respond to inquiries',
      examples: ['Account notifications', 'Policy updates', 'Support responses']
    },
    {
      purpose: 'Improvement',
      description: 'Analyze usage to improve our services',
      examples: ['Feature usage analytics', 'Performance monitoring', 'User experience research']
    },
  ];

  const userRights = [
    {
      right: 'Access',
      icon: FiEye,
      description: 'Request a copy of your personal data'
    },
    {
      right: 'Correction',
      icon: FiSettings,
      description: 'Update or correct your information'
    },
    {
      right: 'Deletion',
      icon: FiTrash2,
      description: 'Request deletion of your account and data'
    },
    {
      right: 'Portability',
      icon: FiDatabase,
      description: 'Export your contributions in a standard format'
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      {/* Header Section */}
      <VStack spacing={8} mb={12} textAlign="center">
        <VStack spacing={4}>
          <Badge colorScheme="african" variant="subtle" px={4} py={2} borderRadius="full">
            🔒 Privacy Policy
          </Badge>
          <Heading size="2xl" color="african.900">
            Your Privacy Matters
          </Heading>
          <Text fontSize="xl" color="gray.700" maxW="800px" lineHeight="1.6">
            This privacy policy explains how Afropedia collects, uses, and protects your personal 
            information when you use our platform.
          </Text>
          <Text fontSize="sm" color="gray.600">
            Last updated: December 2024
          </Text>
        </VStack>
      </VStack>

      {/* Data Collection */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Information We Collect
            </Heading>
            <Text color="gray.700" maxW="600px">
              We collect information to provide better services to our users and maintain 
              the quality of our academic platform
            </Text>
          </VStack>

          <VStack spacing={6} w="full">
            {dataTypes.map((section, index) => (
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

      {/* How We Use Data */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              How We Use Your Information
            </Heading>
            <Text color="gray.700" maxW="600px">
              We use your information only for legitimate purposes related to operating 
              and improving Afropedia
            </Text>
          </VStack>

          <TableContainer w="full">
            <Card bg={cardBg} shadow="md">
              <CardBody p={0}>
                <Table variant="simple">
                  <Tbody>
                    {dataUses.map((use, index) => (
                      <Tr key={index}>
                        <Td borderColor="gray.200" p={6}>
                          <VStack align="start" spacing={3}>
                            <Heading size="sm" color="african.900">
                              {use.purpose}
                            </Heading>
                            <Text color="gray.700" fontSize="sm">
                              {use.description}
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                              {use.examples.map((example, exampleIndex) => (
                                <Badge key={exampleIndex} variant="outline" colorScheme="african" size="sm">
                                  {example}
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TableContainer>
        </VStack>
      </Box>

      {/* Data Security */}
      <Box mb={16}>
        <Card bg="blue.50" border="1px solid" borderColor="blue.200" shadow="md">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={4} textAlign="center">
                <Box
                  p={3}
                  bg="blue.100"
                  color="blue.600"
                  borderRadius="full"
                >
                  <FiShield size="24px" />
                </Box>
                <Heading size="lg" color="blue.700">
                  Data Security & Protection
                </Heading>
                <Text color="blue.600" maxW="600px">
                  We implement industry-standard security measures to protect your information
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
                <VStack spacing={3} textAlign="center">
                  <LockIcon color="blue.500" boxSize={6} />
                  <Text fontWeight="medium" color="blue.700">Encryption</Text>
                  <Text fontSize="sm" color="blue.600">
                    Data encrypted in transit and at rest using industry standards
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <FiDatabase color="blue.500" size="24px" />
                  <Text fontWeight="medium" color="blue.700">Secure Storage</Text>
                  <Text fontSize="sm" color="blue.600">
                    Data stored on secure servers with access controls and monitoring
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <FiUsers color="blue.500" size="24px" />
                  <Text fontWeight="medium" color="blue.700">Limited Access</Text>
                  <Text fontSize="sm" color="blue.600">
                    Only authorized personnel can access user data, on a need-to-know basis
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* User Rights */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Your Rights & Control
            </Heading>
            <Text color="gray.700" maxW="600px">
              You have control over your personal information and can exercise these rights at any time
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
            {userRights.map((right, index) => (
              <Card key={index} bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <HStack align="start" spacing={4}>
                    <Box
                      p={3}
                      bg="african.100"
                      color="african.600"
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      <right.icon size="20px" />
                    </Box>
                    <VStack align="start" spacing={3}>
                      <Heading size="sm" color="african.900">
                        Right to {right.right}
                      </Heading>
                      <Text color="gray.700" fontSize="sm">
                        {right.description}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Data Sharing */}
      <Box mb={16}>
        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="african.900">
                  Data Sharing & Third Parties
                </Heading>
                <Text color="gray.700" maxW="600px">
                  We do not sell your personal information. Limited sharing occurs only in these circumstances:
                </Text>
              </VStack>

              <List spacing={3} w="full" maxW="800px">
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text as="span" color="gray.700">
                    <strong>Service Providers:</strong> Trusted partners who help operate our platform (hosting, analytics, security)
                  </Text>
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text as="span" color="gray.700">
                    <strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety
                  </Text>
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text as="span" color="gray.700">
                    <strong>Public Content:</strong> Your contributions are publicly visible as part of Afropedia's mission
                  </Text>
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text as="span" color="gray.700">
                    <strong>Aggregated Data:</strong> Anonymous, aggregated statistics for research and improvement purposes
                  </Text>
                </ListItem>
              </List>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Data Retention */}
      <Box mb={16}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <FiClock color="orange.500" size="24px" />
                  <Heading size="md" color="african.900">
                    Data Retention
                  </Heading>
                </HStack>
                <Text color="gray.700" fontSize="sm">
                  We retain your information only as long as necessary to provide our services 
                  and comply with legal obligations. Account data is deleted within 90 days 
                  of account closure, though public contributions may remain for historical purposes.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <FiMail color="blue.500" size="24px" />
                  <Heading size="md" color="african.900">
                    Contact Us
                  </Heading>
                </HStack>
                <Text color="gray.700" fontSize="sm">
                  Questions about this privacy policy or how we handle your data? 
                  Contact our privacy team at <strong>privacy@afropedia.org</strong> or 
                  use our contact form. We respond to all privacy inquiries within 30 days.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Policy Updates */}
      <Box>
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle color="blue.800">
              Policy Updates
            </AlertTitle>
            <AlertDescription color="blue.700">
              We may update this privacy policy from time to time. When we do, we'll notify users via email 
              and post the updated policy on this page. Continued use of Afropedia after changes indicates 
              acceptance of the updated policy.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    </Container>
  );
};

export default PrivacyPage;
