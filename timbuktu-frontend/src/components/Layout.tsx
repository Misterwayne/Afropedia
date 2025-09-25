// components/Layout.tsx
import React, { ReactNode } from 'react';
import { Box, Flex, Button, Heading, Spacer, Container, Text, Menu, MenuButton, MenuList, MenuItem, IconButton, useDisclosure, Spinner } from '@chakra-ui/react';
import { HamburgerIcon, AddIcon, CloseIcon } from '@chakra-ui/icons'; // Icons
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // Use correct path

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated, isAuthCheckComplete } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For mobile menu

  return (
    <Box>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg="teal.500"
        color="white"
      >
        {/* Logo / Brand Name */}
        <Flex align="center" mr={5}>
          <Link href="/" passHref>
            <Heading as="h1" size="lg" letterSpacing={'-.1rem'} cursor="pointer">
              WikiClone
            </Heading>
          </Link>
        </Flex>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'block', md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="outline"
          aria-label="Toggle Navigation"
          colorScheme="whiteAlpha"
        />

        {/* Desktop Menu Items / Authentication Status */}
        <Box
          display={{ base: 'none', md: 'flex' }}
          width={{ base: 'full', md: 'auto' }}
          alignItems="center"
          flexGrow={1}
        >
          <Spacer /> {/* Pushes auth items to the right */}
          {!isAuthCheckComplete ? (
            <Spinner size="sm" color="white" />
          ) : isAuthenticated() ? (
            <>
              <Text mr={4} display={{ base: 'none', lg: 'inline' }}>Welcome, {user?.username}!</Text>
              <Link href="/library" passHref><Button size="sm" variant="ghost" colorScheme="whiteAlpha" ml={2}>Library</Button></Link>
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <Link href="/moderation" passHref>
            <Button size="sm" variant="ghost" colorScheme="whiteAlpha" ml={2}>Moderation</Button>
          </Link>
        )}
        {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'editor') && (
          <Link href="/peer-review" passHref>
            <Button size="sm" variant="ghost" colorScheme="whiteAlpha" ml={2}>Peer Review</Button>
          </Link>
        )}
              <Link href="/edit/new" passHref>
                 <Button leftIcon={<AddIcon />} colorScheme="whiteAlpha" variant="outline" mr={2} size="sm">New Article</Button>
              </Link>
              <Button colorScheme="whiteAlpha" variant="ghost" onClick={logout} size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" passHref>
                 <Button colorScheme="whiteAlpha" variant="ghost" mr={2} size="sm">Login</Button>
              </Link>
              <Link href="/auth/register" passHref>
                 <Button colorScheme="whiteAlpha" variant="outline" size="sm">Register</Button>
              </Link>
            </>
          )}
        </Box>
      </Flex>

      {/* Mobile Menu Content */}
      <Box
        display={{ base: isOpen ? 'block' : 'none', md: 'none' }}
        pb={4}
        bg="teal.500"
        color="white"
      >
        <Flex direction="column" align="center">
         {!isAuthCheckComplete ? (
            <Spinner size="sm" color="white" my={2} />
          ) : isAuthenticated() ? (
             <>
              <Text my={2}>Welcome, {user?.username}!</Text>
              <Link href="/edit/new" passHref>
                 <Button leftIcon={<AddIcon />} w="full" colorScheme="whiteAlpha" variant="ghost" my={1}>New Article</Button>
              </Link>
              <Button w="full" colorScheme="whiteAlpha" variant="ghost" onClick={logout} my={1}>
                Logout
              </Button>
            </>
          ) : (
            <>
               <Link href="/auth/login" passHref>
                 <Button w="full" colorScheme="whiteAlpha" variant="ghost" my={1}>Login</Button>
              </Link>
              <Link href="/auth/register" passHref>
                 <Button w="full" colorScheme="whiteAlpha" variant="ghost" my={1}>Register</Button>
              </Link>
            </>
          )}
        </Flex>
      </Box>

      {/* Main Content Area */}
      <Container maxW="container.xl" mt={8} mb={8} minH="70vh">
        {/* Render children only after auth check is complete to avoid flashes */}
        {isAuthCheckComplete ? children : <Flex justify="center" align="center" height="50vh"><Spinner size="xl" /></Flex>}
      </Container>

       {/* Optional Footer */}
       <Box as="footer" py={4} textAlign="center" borderTop="1px" borderColor="gray.200">
            <Text fontSize="sm">WikiClone © {new Date().getFullYear()}</Text>
       </Box>
    </Box>
  );
};

export default Layout;