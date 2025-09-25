import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  CardBody,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Divider,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';
import apiClient from '@/lib/api';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isAuthCheckComplete } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    articlesCreated: 0,
    reviewsCompleted: 0,
  });
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
  });
  
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    setStatsLoading(true);
    try {
      // Fetch user's articles count
      const articlesResponse = await apiClient.get(`/articles/user/${user.id}`).catch(() => ({ data: [] }));
      
      // Fetch user's reviews count using correct endpoint
      const reviewsResponse = await apiClient.get(`/peer-review/reviews/reviewer/${user.id}`).catch(() => ({ data: [] }));
      
      setUserStats({
        articlesCreated: Array.isArray(articlesResponse.data) ? articlesResponse.data.length : 0,
        reviewsCompleted: Array.isArray(reviewsResponse.data) ? reviewsResponse.data.length : 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Keep default values of 0
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile via API
      await apiClient.patch('/auth/profile', profileData);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.detail || "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

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
            You need to be logged in to view your profile.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" color="african.800" mb={2}>
            Profile & Settings
          </Heading>
          <Text color="gray.600">
            Manage your account information and preferences
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: '1fr 2fr' }} gap={8}>
          {/* Profile Overview */}
          <GridItem>
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Avatar
                    size="xl"
                    name={user?.username || user?.email}
                    bg="african.500"
                    color="white"
                  />
                  <VStack spacing={1}>
                    <Heading size="md" color="african.800">
                      {user?.username || user?.email?.split('@')[0]}
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {user?.email}
                    </Text>
                    {user?.role && (
                      <Badge colorScheme="african" textTransform="capitalize">
                        {user.role}
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Stats */}
            <Card mt={6}>
              <CardBody>
                <Heading size="sm" mb={4} color="african.800">
                  Statistics
                </Heading>
                <VStack spacing={4}>
                  <Stat>
                    <StatLabel>Articles Created</StatLabel>
                    <StatNumber>
                      {statsLoading ? <Spinner size="sm" /> : userStats.articlesCreated}
                    </StatNumber>
                    <StatHelpText>Articles you've written</StatHelpText>
                  </Stat>
                  <Divider />
                  <Stat>
                    <StatLabel>Reviews Completed</StatLabel>
                    <StatNumber>
                      {statsLoading ? <Spinner size="sm" /> : userStats.reviewsCompleted}
                    </StatNumber>
                    <StatHelpText>Peer reviews you've done</StatHelpText>
                  </Stat>
                  <Divider />
                  <Stat>
                    <StatLabel>Reputation Score</StatLabel>
                    <StatNumber>{user?.reputation_score || 0}</StatNumber>
                    <StatHelpText>Based on contributions</StatHelpText>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Profile Settings */}
          <GridItem>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={6}>
                  <Heading size="md" color="african.800">
                    Account Information
                  </Heading>
                  {!isEditing ? (
                    <Button
                      leftIcon={<FiEdit />}
                      size="sm"
                      colorScheme="african"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <HStack spacing={2}>
                      <Button
                        leftIcon={<FiSave />}
                        size="sm"
                        colorScheme="african"
                        onClick={handleSave}
                        isLoading={loading}
                        loadingText="Saving"
                      >
                        Save
                      </Button>
                      <Button
                        leftIcon={<FiX />}
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  )}
                </HStack>

                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({ ...profileData, username: e.target.value })
                      }
                      isReadOnly={!isEditing}
                      bg={isEditing ? 'white' : 'gray.50'}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      isReadOnly={!isEditing}
                      bg={isEditing ? 'white' : 'gray.50'}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      isReadOnly={!isEditing}
                      bg={isEditing ? 'white' : 'gray.50'}
                      rows={4}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Account Status */}
            <Card mt={6}>
              <CardBody>
                <Heading size="sm" mb={4} color="african.800">
                  Account Status
                </Heading>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text>Account Status</Text>
                    <Badge colorScheme={user?.is_active ? 'green' : 'red'}>
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Member Since</Text>
                    <Text fontSize="sm" color="gray.600">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default ProfilePage;
