// pages/terms.tsx
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
  OrderedList,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import {
  FiFileText,
  FiUsers,
  FiShield,
  FiBook,
  FiAward,
  FiInfo,
  FiAlertCircle,
  FiClock,
} from 'react-icons/fi';

const TermsPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const keyTerms = [
    {
      term: 'User Account',
      definition: 'Your registered account that allows you to contribute to and interact with Afropedia',
      icon: FiUsers,
      color: 'african'
    },
    {
      term: 'Content',
      definition: 'All text, images, media, and other materials submitted to or displayed on Afropedia',
      icon: FiBook,
      color: 'forest'
    },
    {
      term: 'Contribution',
      definition: 'Any content you create, edit, or submit to Afropedia, including articles and reviews',
      icon: FiAward,
      color: 'sunset'
    },
    {
      term: 'Services',
      definition: 'All features, functionality, and resources provided by the Afropedia platform',
      icon: FiShield,
      color: 'sky'
    },
  ];

  const userObligations = [
    {
      category: 'Account Responsibilities',
      items: [
        'Provide accurate and current information during registration',
        'Maintain the security of your account credentials',
        'Notify us immediately of any unauthorized account access',
        'Take responsibility for all activities under your account'
      ]
    },
    {
      category: 'Content Standards',
      items: [
        'Ensure all contributions are accurate and well-sourced',
        'Respect intellectual property rights and cite sources properly',
        'Write in a neutral, encyclopedic tone appropriate for academic content',
        'Submit only original work or properly attributed content'
      ]
    },
    {
      category: 'Community Conduct',
      items: [
        'Treat all community members with respect and professionalism',
        'Follow our Community Guidelines in all interactions',
        'Participate constructively in peer review and discussion processes',
        'Report violations of these terms or community standards'
      ]
    },
  ];

  const prohibitedUses = [
    'Violating any applicable laws or regulations',
    'Infringing on intellectual property rights of others',
    'Submitting false, misleading, or deliberately inaccurate information',
    'Harassing, threatening, or discriminating against other users',
    'Attempting to gain unauthorized access to our systems',
    'Using automated tools to scrape or download content without permission',
    'Distributing malware, viruses, or other harmful code',
    'Using the service for commercial purposes without authorization',
  ];

  return (
    <Container maxW="7xl" py={8}>
      {/* Header Section */}
      <VStack spacing={8} mb={12} textAlign="center">
        <VStack spacing={4}>
          <Badge colorScheme="african" variant="subtle" px={4} py={2} borderRadius="full">
            📋 Terms of Service
          </Badge>
          <Heading size="2xl" color="african.900">
            Terms of Service
          </Heading>
          <Text fontSize="xl" color="gray.700" maxW="800px" lineHeight="1.6">
            These terms govern your use of Afropedia and outline the rights and responsibilities 
            of all community members.
          </Text>
          <Text fontSize="sm" color="gray.600">
            Last updated: December 2024 • Effective Date: December 2024
          </Text>
        </VStack>
      </VStack>

      {/* Acceptance */}
      <Box mb={16}>
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle color="blue.800">
              Agreement to Terms
            </AlertTitle>
            <AlertDescription color="blue.700">
              By accessing or using Afropedia, you agree to be bound by these Terms of Service and our Privacy Policy. 
              If you do not agree to these terms, please do not use our services.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>

      {/* Key Definitions */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Key Terms & Definitions
            </Heading>
            <Text color="gray.700" maxW="600px">
              Understanding these key terms will help you navigate our Terms of Service
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
            {keyTerms.map((item, index) => (
              <Card key={index} bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <HStack align="start" spacing={4}>
                    <Box
                      p={3}
                      bg={`${item.color}.100`}
                      color={`${item.color}.600`}
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      <item.icon size="20px" />
                    </Box>
                    <VStack align="start" spacing={3}>
                      <Heading size="sm" color="african.900">
                        {item.term}
                      </Heading>
                      <Text color="gray.700" fontSize="sm" lineHeight="1.6">
                        {item.definition}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* User Obligations */}
      <Box mb={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              Your Responsibilities
            </Heading>
            <Text color="gray.700" maxW="600px">
              As a member of the Afropedia community, you agree to these responsibilities
            </Text>
          </VStack>

          <VStack spacing={6} w="full">
            {userObligations.map((section, index) => (
              <Card key={index} bg={cardBg} shadow="md" w="full">
                <CardHeader>
                  <Heading size="md" color="african.900">
                    {section.category}
                  </Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <List spacing={2}>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex}>
                        <ListIcon as={CheckCircleIcon} color="african.500" />
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

      {/* Content Licensing */}
      <Box mb={16}>
        <Card bg="green.50" border="1px solid" borderColor="green.200" shadow="md">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={4} textAlign="center">
                <Box
                  p={3}
                  bg="green.100"
                  color="green.600"
                  borderRadius="full"
                >
                  <FiFileText size="24px" />
                </Box>
                <Heading size="lg" color="green.700">
                  Content Licensing & Rights
                </Heading>
              </VStack>

              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" color="green.700" mb={3}>
                    Your Content Rights
                  </Heading>
                  <Text color="green.600" mb={4}>
                    When you contribute content to Afropedia, you grant us and the community certain rights:
                  </Text>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      <Text as="span" color="green.700">
                        You retain ownership of your original contributions
                      </Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      <Text as="span" color="green.700">
                        You grant Afropedia a perpetual, worldwide license to use, modify, and distribute your contributions
                      </Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      <Text as="span" color="green.700">
                        Your contributions may be edited, improved, or built upon by other community members
                      </Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      <Text as="span" color="green.700">
                        You will be credited for your contributions according to our attribution standards
                      </Text>
                    </ListItem>
                  </List>
                </Box>

                <Divider borderColor="green.300" />

                <Box>
                  <Heading size="md" color="green.700" mb={3}>
                    Afropedia Content License
                  </Heading>
                  <Text color="green.600">
                    All content on Afropedia is made available under the Creative Commons Attribution-ShareAlike 4.0 
                    International License, promoting free access to knowledge while ensuring proper attribution.
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Prohibited Uses */}
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
                  <FiAlertCircle size="24px" />
                </Box>
                <Heading size="lg" color="red.700">
                  Prohibited Uses
                </Heading>
                <Text color="red.600" maxW="600px">
                  The following activities are strictly prohibited on Afropedia
                </Text>
              </VStack>

              <List spacing={3} w="full" maxW="800px">
                {prohibitedUses.map((use, index) => (
                  <ListItem key={index}>
                    <ListIcon as={WarningIcon} color="red.500" />
                    <Text as="span" color="red.700">{use}</Text>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Service Availability */}
      <Box mb={16}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <FiClock color="orange.500" size="24px" />
                  <Heading size="md" color="african.900">
                    Service Availability
                  </Heading>
                </HStack>
                <Text color="gray.700" fontSize="sm">
                  While we strive to maintain continuous service availability, Afropedia may 
                  occasionally be unavailable due to maintenance, technical issues, or other factors. 
                  We do not guarantee uninterrupted access to our services.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <FiShield color="blue.500" size="24px" />
                  <Heading size="md" color="african.900">
                    Limitation of Liability
                  </Heading>
                </HStack>
                <Text color="gray.700" fontSize="sm">
                  Afropedia is provided "as is" without warranties of any kind. We are not liable 
                  for any damages arising from your use of our services, including but not limited 
                  to direct, indirect, or consequential damages.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Account Termination */}
      <Box mb={16}>
        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="african.900">
                  Account Termination
                </Heading>
                <Text color="gray.700" maxW="600px">
                  Understanding when and how accounts may be terminated
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                <VStack spacing={4} align="start">
                  <Heading size="md" color="african.900">
                    By You
                  </Heading>
                  <Text color="gray.700" fontSize="sm">
                    You may terminate your account at any time through your account settings. 
                    Upon termination, your personal data will be deleted according to our Privacy Policy, 
                    though your public contributions may remain for the benefit of the community.
                  </Text>
                </VStack>

                <VStack spacing={4} align="start">
                  <Heading size="md" color="african.900">
                    By Afropedia
                  </Heading>
                  <Text color="gray.700" fontSize="sm">
                    We may suspend or terminate accounts that violate these Terms of Service or 
                    our Community Guidelines. We will provide notice when possible, but reserve 
                    the right to terminate accounts immediately for serious violations.
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Governing Law */}
      <Box mb={16}>
        <Card bg={cardBg} shadow="md">
          <CardBody p={6}>
            <VStack spacing={4}>
              <HStack spacing={3}>
                <FiInfo color="purple.500" size="24px" />
                <Heading size="md" color="african.900">
                  Governing Law & Disputes
                </Heading>
              </HStack>
              <Text color="gray.700" fontSize="sm" textAlign="center">
                These Terms of Service are governed by international law and best practices for 
                educational platforms. Any disputes will be resolved through good faith negotiation, 
                mediation, or arbitration as appropriate. We encourage community members to first 
                contact us directly to resolve any concerns.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Changes to Terms */}
      <Box mb={16}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle color="orange.800">
              Changes to These Terms
            </AlertTitle>
            <AlertDescription color="orange.700">
              We may update these Terms of Service from time to time to reflect changes in our services, 
              legal requirements, or community needs. We will notify users of significant changes via email 
              and prominently display the updated terms on our platform.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>

      {/* Contact Information */}
      <Box>
        <Card bg="african.800" color="white" shadow="lg">
          <CardBody p={8} textAlign="center">
            <VStack spacing={6}>
              <VStack spacing={4}>
                <Heading size="lg">
                  Questions About These Terms?
                </Heading>
                <Text opacity={0.9} maxW="600px">
                  If you have questions about these Terms of Service or need clarification 
                  on any provisions, please contact us.
                </Text>
              </VStack>

              <VStack spacing={2}>
                <Text fontSize="sm" opacity={0.8}>
                  Email: <strong>legal@afropedia.org</strong>
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  For general inquiries: <strong>info@afropedia.org</strong>
                </Text>
              </VStack>

              <Text fontSize="xs" opacity={0.7} maxW="500px">
                We aim to respond to all legal and terms-related inquiries within 7 business days.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
};

export default TermsPage;
