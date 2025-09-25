// components/AfropediaLayout.tsx
import React, { ReactNode } from 'react';
import {
  Box,
  Flex,
  Button,
  Heading,
  Container,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Spinner,
  HStack,
  VStack,
  Badge,
  Avatar,
  Divider,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  SearchIcon, 
  AddIcon,
  BellIcon,
  ChevronDownIcon 
} from '@chakra-ui/icons';
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiSearch, 
  FiBookOpen, 
  FiAward,
  FiSettings,
  FiLogOut,
  FiSun
} from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface AfropediaLayoutProps {
  children: ReactNode;
}

const AfropediaLayout: React.FC<AfropediaLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated, isAuthCheckComplete } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgGradient = useColorModeValue(
    'linear(to-r, african.500, sunset.500)',
    'linear(to-r, african.600, sunset.600)'
  );
  
  const headerBg = useColorModeValue('white', 'gray.800');
  const headerShadow = useColorModeValue('lg', 'dark-lg');

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box
        position="sticky"
        top="0"
        zIndex="sticky"
        bg={headerBg}
        shadow={headerShadow}
        borderBottom="3px solid"
        borderColor="african.500"
      >
        <Container maxW="7xl" px={4}>
          <Flex h="16" alignItems="center" justifyContent="space-between">
            {/* Logo */}
            <HStack spacing={4}>
              <Link href="/" passHref>
                <Flex alignItems="center" cursor="pointer" _hover={{ transform: 'scale(1.05)' }} transition="all 0.2s">
                  <Box
                    w="40px"
                    h="40px"
                    mr={3}
                  >
                    <img 
                      src="/afrologo-textless.png" 
                      alt="Afropedia Logo" 
                      width="40" 
                      height="40"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading 
                      size="lg" 
                      color="african.800"
                      fontWeight="bold"
                      lineHeight="1"
                    >
                      Afropedia
                    </Heading>
                    <Text fontSize="xs" color="african.600" fontWeight="medium">
                      African Encyclopedia
                    </Text>
                  </VStack>
                </Flex>
              </Link>
            </HStack>

            {/* Desktop Navigation */}
            <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
              <Link href="/" passHref>
                <Button variant="ghost" size="sm" leftIcon={<FiHome />} colorScheme="african">
                  Home
                </Button>
              </Link>
              
              <Link href="/search" passHref>
                <Button variant="ghost" size="sm" leftIcon={<FiSearch />} colorScheme="african">
                  Browse
                </Button>
              </Link>
              
              <Link href="/library" passHref>
                <Button variant="ghost" size="sm" leftIcon={<FiBookOpen />} colorScheme="african">
                  Library
                </Button>
              </Link>

              {/* Authenticated User Menu */}
              {isAuthCheckComplete && isAuthenticated() && user && (
                <>
                  <Link href="/edit/new" passHref>
                    <Button 
                      variant="solid" 
                      size="sm" 
                      leftIcon={<AddIcon />} 
                      colorScheme="african"
                      bg="african.500"
                      _hover={{ bg: 'african.600', transform: 'translateY(-1px)' }}
                    >
                      Create
                    </Button>
                  </Link>

                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                    <Link href="/moderation" passHref>
                      <Button variant="ghost" size="sm" leftIcon={<FiAward />} colorScheme="african">
                        Moderation
                      </Button>
                    </Link>
                  )}

                  {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'editor') && (
                    <Link href="/peer-review" passHref>
                      <Button variant="ghost" size="sm" leftIcon={<FiUsers />} colorScheme="african">
                        Peer Review
                      </Button>
                    </Link>
                  )}

                  {/* User Menu */}
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      size="sm"
                      rightIcon={<ChevronDownIcon />}
                      colorScheme="african"
                    >
                      <HStack spacing={2}>
                        <Avatar 
                          size="xs" 
                          name={user.username || user.email} 
                          bg="african.500"
                          color="white"
                        />
                        <Text fontSize="sm" fontWeight="medium">
                          {user.username || user.email?.split('@')[0]}
                        </Text>
                        {user.role && (
                          <Badge 
                            size="sm" 
                            colorScheme="african" 
                            variant="subtle"
                            textTransform="capitalize"
                          >
                            {user.role}
                          </Badge>
                        )}
                      </HStack>
                    </MenuButton>
                    <MenuList>
                      <Link href="/profile" passHref>
                        <MenuItem icon={<FiSettings />}>
                          Profile & Settings
                        </MenuItem>
                      </Link>
                      <Link href="/my-articles" passHref>
                        <MenuItem icon={<FiBook />}>
                          My Articles
                        </MenuItem>
                      </Link>
                      <Link href="/notifications" passHref>
                        <MenuItem icon={<BellIcon />}>
                          Notifications
                        </MenuItem>
                      </Link>
                      
                      {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'editor') && (
                        <>
                          <Divider />
                          <Link href="/peer-review/analytics" passHref>
                            <MenuItem icon={<FiAward />}>
                              Review Analytics
                            </MenuItem>
                          </Link>
                        </>
                      )}
                      
                      <Divider />
                      <MenuItem 
                        icon={<FiLogOut />} 
                        onClick={logout}
                        color="red.500"
                      >
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              )}

              {/* Guest User Menu */}
              {isAuthCheckComplete && !isAuthenticated() && (
                <HStack spacing={2}>
                  <Link href="/auth/login" passHref>
                    <Button variant="ghost" size="sm" colorScheme="african">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" passHref>
                    <Button 
                      variant="solid" 
                      size="sm" 
                      colorScheme="african"
                      bg="african.500"
                      _hover={{ bg: 'african.600', transform: 'translateY(-1px)' }}
                    >
                      Join Afropedia
                    </Button>
                  </Link>
                </HStack>
              )}

              {/* Loading State */}
              {!isAuthCheckComplete && (
                <Spinner size="sm" color="african.500" />
              )}
            </HStack>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              variant="ghost"
              colorScheme="african"
              aria-label="Toggle Navigation"
            />
          </Flex>

          {/* Mobile Menu */}
          {isOpen && (
            <Box pb={4} display={{ md: 'none' }}>
              <Stack spacing={2}>
                <Link href="/" passHref>
                  <Button variant="ghost" size="sm" justifyContent="flex-start" leftIcon={<FiHome />} w="full">
                    Home
                  </Button>
                </Link>
                <Link href="/search" passHref>
                  <Button variant="ghost" size="sm" justifyContent="flex-start" leftIcon={<FiSearch />} w="full">
                    Browse
                  </Button>
                </Link>
                <Link href="/library" passHref>
                  <Button variant="ghost" size="sm" justifyContent="flex-start" leftIcon={<FiBookOpen />} w="full">
                    Library
                  </Button>
                </Link>

                {isAuthCheckComplete && isAuthenticated() && user && (
                  <>
                    <Divider />
                    <Link href="/edit/new" passHref>
                      <Button variant="solid" size="sm" justifyContent="flex-start" leftIcon={<AddIcon />} w="full" colorScheme="african">
                        Create Article
                      </Button>
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'moderator') && (
                      <Link href="/moderation" passHref>
                        <Button variant="ghost" size="sm" justifyContent="flex-start" leftIcon={<FiAward />} w="full">
                          Moderation
                        </Button>
                      </Link>
                    )}
                    
                    {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'editor') && (
                      <Link href="/peer-review" passHref>
                        <Button variant="ghost" size="sm" justifyContent="flex-start" leftIcon={<FiUsers />} w="full">
                          Peer Review
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/profile" passHref>
                      <Button variant="ghost" size="sm" justifyContent="flex-start" leftIcon={<FiSettings />} w="full">
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      justifyContent="flex-start" 
                      leftIcon={<FiLogOut />} 
                      w="full"
                      color="red.500"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </>
                )}

                {isAuthCheckComplete && !isAuthenticated() && (
                  <>
                    <Divider />
                    <Link href="/auth/login" passHref>
                      <Button variant="ghost" size="sm" justifyContent="flex-start" w="full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" passHref>
                      <Button variant="solid" size="sm" justifyContent="flex-start" w="full" colorScheme="african">
                        Join Afropedia
                      </Button>
                    </Link>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" minH="calc(100vh - 64px)" bg="african.50">
        {children}
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        bg="african.800"
        color="white"
        py={8}
        mt={12}
      >
        <Container maxW="7xl" px={4}>
          <VStack spacing={6}>
            <HStack spacing={8} flexWrap="wrap" justify="center">
              <Link href="/about">
                <Text _hover={{ color: 'african.200' }} cursor="pointer">About</Text>
              </Link>
              <Link href="/contact">
                <Text _hover={{ color: 'african.200' }} cursor="pointer">Contact</Text>
              </Link>
              <Link href="/community-guidelines">
                <Text _hover={{ color: 'african.200' }} cursor="pointer">Community Guidelines</Text>
              </Link>
              <Link href="/privacy">
                <Text _hover={{ color: 'african.200' }} cursor="pointer">Privacy</Text>
              </Link>
              <Link href="/terms">
                <Text _hover={{ color: 'african.200' }} cursor="pointer">Terms</Text>
              </Link>
            </HStack>
            
            <Divider borderColor="african.600" />
            
            <VStack spacing={2}>
              <Text fontSize="lg" fontWeight="bold" color="african.200">
                Afropedia
              </Text>
              <Text fontSize="sm" textAlign="center" color="african.300">
                The premier African encyclopedia with academic peer review.
                <br />
                Celebrating African knowledge, culture, and heritage.
              </Text>
              <Text fontSize="xs" color="african.400" mt={2}>
                © 2024 Afropedia. Made with ❤️ for Africa.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default AfropediaLayout;
