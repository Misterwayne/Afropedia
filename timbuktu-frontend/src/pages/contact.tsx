// pages/contact.tsx
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  Badge,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  EmailIcon,
  PhoneIcon,
} from '@chakra-ui/icons';
import {
  FiMail,
  FiMessageCircle,
  FiHelpCircle,
  FiFlag,
  FiUsers,
  FiBook,
} from 'react-icons/fi';
import { useState } from 'react';

const ContactPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactReasons = [
    {
      icon: FiBook,
      title: 'Content Issues',
      description: 'Report errors, suggest improvements, or discuss article content',
      color: 'african'
    },
    {
      icon: FiUsers,
      title: 'Contributor Support',
      description: 'Questions about contributing, peer review process, or account issues',
      color: 'forest'
    },
    {
      icon: FiFlag,
      title: 'Report Content',
      description: 'Report inappropriate content, copyright issues, or policy violations',
      color: 'sunset'
    },
    {
      icon: FiHelpCircle,
      title: 'General Support',
      description: 'Technical issues, feature requests, or general questions',
      color: 'sky'
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      // In a real implementation, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message Sent',
        description: 'Thank you for contacting us. We\'ll get back to you within 24-48 hours.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error sending your message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      {/* Header Section */}
      <VStack spacing={8} mb={12} textAlign="center">
        <VStack spacing={4}>
          <Badge colorScheme="african" variant="subtle" px={4} py={2} borderRadius="full">
            📧 Contact Us
          </Badge>
          <Heading size="2xl" color="african.900">
            Get in Touch
          </Heading>
          <Text fontSize="xl" color="gray.700" maxW="800px" lineHeight="1.6">
            Have questions, suggestions, or need support? We're here to help you make the most 
            of Afropedia and contribute to our growing knowledge community.
          </Text>
        </VStack>
      </VStack>

      {/* Contact Reasons */}
      <Box mb={12}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="african.900">
              What can we help you with?
            </Heading>
            <Text color="gray.700">
              Choose the category that best describes your inquiry
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {contactReasons.map((reason, index) => (
              <Card 
                key={index} 
                bg={cardBg} 
                shadow="md" 
                _hover={{ transform: 'translateY(-2px)' }} 
                transition="all 0.3s"
                cursor="pointer"
                onClick={() => setFormData(prev => ({ ...prev, category: reason.title }))}
                border={formData.category === reason.title ? '2px solid' : '1px solid'}
                borderColor={formData.category === reason.title ? `${reason.color}.500` : 'gray.200'}
              >
                <CardBody textAlign="center" p={6}>
                  <VStack spacing={4}>
                    <Box
                      p={3}
                      bg={`${reason.color}.100`}
                      color={`${reason.color}.600`}
                      borderRadius="full"
                    >
                      <reason.icon size="24px" />
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="sm" color="african.900">
                        {reason.title}
                      </Heading>
                      <Text fontSize="xs" color="gray.600" textAlign="center">
                        {reason.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Contact Form and Info */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
        {/* Contact Form */}
        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="african.900">
                  Send us a Message
                </Heading>
                <Text color="gray.700">
                  Fill out the form below and we'll get back to you soon
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="gray.700">Name</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'african.500', bg: 'white' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700">Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'african.500', bg: 'white' }}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Category</FormLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Select a category"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'african.500', bg: 'white' }}
                    >
                      <option value="Content Issues">Content Issues</option>
                      <option value="Contributor Support">Contributor Support</option>
                      <option value="Report Content">Report Content</option>
                      <option value="General Support">General Support</option>
                      <option value="Partnership Inquiry">Partnership Inquiry</option>
                      <option value="Media Inquiry">Media Inquiry</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Subject</FormLabel>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief subject line"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'african.500', bg: 'white' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Message</FormLabel>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'african.500', bg: 'white' }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="african"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Sending..."
                    leftIcon={<FiMail />}
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <VStack spacing={8} align="stretch">
          {/* Response Time */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Box
                  p={3}
                  bg="african.100"
                  color="african.600"
                  borderRadius="full"
                >
                  <FiMessageCircle size="24px" />
                </Box>
                <VStack spacing={2} textAlign="center">
                  <Heading size="md" color="african.900">
                    Response Time
                  </Heading>
                  <Text color="gray.700" fontSize="sm">
                    We typically respond within 24-48 hours during business days. 
                    Complex technical issues may take longer to resolve.
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Alternative Contact */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Heading size="md" color="african.900">
                  Other Ways to Reach Us
                </Heading>
                
                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <EmailIcon color="african.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" color="african.900">General Inquiries</Text>
                      <Text fontSize="sm" color="gray.600">info@afropedia.org</Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    <FiFlag color="african.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" color="african.900">Content Reports</Text>
                      <Text fontSize="sm" color="gray.600">moderation@afropedia.org</Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    <FiUsers color="african.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" color="african.900">Contributors</Text>
                      <Text fontSize="sm" color="gray.600">contributors@afropedia.org</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* FAQ Link */}
          <Card bg="african.800" color="white" shadow="md">
            <CardBody p={6} textAlign="center">
              <VStack spacing={4}>
                <Box
                  p={3}
                  bg="whiteAlpha.200"
                  borderRadius="full"
                >
                  <FiHelpCircle size="24px" />
                </Box>
                <VStack spacing={2}>
                  <Heading size="md">
                    Quick Answers
                  </Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    Check our Community Guidelines and documentation for 
                    answers to common questions about contributing and using Afropedia.
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Container>
  );
};

export default ContactPage;
