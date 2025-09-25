import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  Avatar,
  Flex,
  Spacer,
  IconButton,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiMessageSquare,
  FiEdit,
  FiAward,
  FiUsers,
  FiMoreVertical,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';
import Link from 'next/link';
import apiClient from '@/lib/api';

interface Notification {
  id: number;
  type: 'review' | 'comment' | 'article' | 'system' | 'peer_review';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  action_url?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
}

const NotificationsPage: React.FC = () => {
  const { user, isAuthenticated, isAuthCheckComplete } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Check if peer review notifications are available
      try {
        const response = await apiClient.get('/peer-review/notifications');
        // Convert peer review notifications to our format if available
        if (response.data && response.data.notifications) {
          const peerReviewNotifications = response.data.notifications.map((notif: any, index: number) => ({
            id: index + 1,
            type: 'peer_review',
            title: 'Peer Review Notification',
            message: notif.message,
            timestamp: new Date().toISOString(),
            is_read: false,
            sender: { name: 'System' },
          }));
          setNotifications(peerReviewNotifications);
        } else {
          setNotifications([]);
        }
      } catch (peerReviewError) {
        // If peer review notifications fail, just show empty state
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // TODO: Implement API call to mark as read
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      toast({
        title: "Marked as read",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Implement API call to mark all as read
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      toast({
        title: "All notifications marked as read",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      // TODO: Implement API call to delete notification
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast({
        title: "Notification deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'peer_review': return FiUsers;
      case 'comment': return FiMessageSquare;
      case 'article': return FiEdit;
      case 'review': return FiAward;
      case 'system': return FiBell;
      default: return FiBell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'peer_review': return 'blue';
      case 'comment': return 'green';
      case 'article': return 'purple';
      case 'review': return 'orange';
      case 'system': return 'gray';
      default: return 'gray';
    }
  };

  const filterNotifications = (type: string) => {
    if (type === 'all') return notifications;
    return notifications.filter(notif => notif.type === type);
  };

  const getTabNotifications = (tabIndex: number) => {
    const types = ['all', 'peer_review', 'comment', 'article', 'system'];
    return filterNotifications(types[tabIndex]);
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

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
            You need to be logged in to view your notifications.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <HStack spacing={3}>
              <Heading as="h1" size="xl" color="african.800">
                Notifications
              </Heading>
              {unreadCount > 0 && (
                <Badge colorScheme="red" borderRadius="full" px={2}>
                  {unreadCount}
                </Badge>
              )}
            </HStack>
            <Text color="gray.600" mt={1}>
              Stay updated with your Afropedia activity
            </Text>
          </Box>
          {unreadCount > 0 && (
            <Button
              leftIcon={<FiCheckCircle />}
              size="sm"
              variant="outline"
              colorScheme="african"
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Flex>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>All ({notifications.length})</Tab>
            <Tab>Reviews ({filterNotifications('peer_review').length})</Tab>
            <Tab>Comments ({filterNotifications('comment').length})</Tab>
            <Tab>Articles ({filterNotifications('article').length})</Tab>
            <Tab>System ({filterNotifications('system').length})</Tab>
          </TabList>

          <TabPanels>
            {[0, 1, 2, 3, 4].map((tabIndex) => (
              <TabPanel key={tabIndex} px={0}>
                {loading ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Spinner size="xl" color="african.500" />
                      <Text>Loading notifications...</Text>
                    </VStack>
                  </Center>
                ) : getTabNotifications(tabIndex).length === 0 ? (
                  <Card>
                    <CardBody textAlign="center" py={12}>
                      <VStack spacing={4}>
                        <Text fontSize="lg" color="gray.500">
                          No notifications yet
                        </Text>
                        <Text fontSize="sm" color="gray.400" textAlign="center">
                          Notifications for reviews, comments, and system updates will appear here.
                          <br />
                          Start contributing to see your activity notifications!
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {getTabNotifications(tabIndex).map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <Card
                          key={notification.id}
                          bg={notification.is_read ? 'white' : 'african.50'}
                          borderLeft={notification.is_read ? '4px solid transparent' : '4px solid'}
                          borderColor={notification.is_read ? 'transparent' : 'african.500'}
                          _hover={{ shadow: 'md' }}
                          transition="all 0.2s"
                        >
                          <CardBody>
                            <Flex align="start" spacing={3}>
                              <Avatar
                                size="sm"
                                bg={`${getNotificationColor(notification.type)}.500`}
                                icon={<IconComponent color="white" />}
                              />
                              <VStack align="start" spacing={1} flex={1} ml={3}>
                                <HStack spacing={2} w="full">
                                  <Text fontWeight="semibold" color="african.800" flex={1}>
                                    {notification.title}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </Text>
                                </HStack>
                                <Text color="gray.600" fontSize="sm">
                                  {notification.message}
                                </Text>
                                {notification.sender && (
                                  <Text fontSize="xs" color="gray.500">
                                    From {notification.sender.name}
                                  </Text>
                                )}
                              </VStack>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Notification options"
                                  icon={<FiMoreVertical />}
                                  size="sm"
                                  variant="ghost"
                                />
                                <MenuList>
                                  {notification.action_url && (
                                    <Link href={notification.action_url} passHref>
                                      <MenuItem icon={<FiEye />}>View</MenuItem>
                                    </Link>
                                  )}
                                  {!notification.is_read && (
                                    <MenuItem 
                                      icon={<FiCheck />}
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Mark as Read
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem 
                                    icon={<FiTrash2 />} 
                                    color="red.500"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Flex>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </VStack>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default NotificationsPage;
