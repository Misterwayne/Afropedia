// pages/auth/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
import {
  Box, Button, FormControl, FormLabel, Input, Heading, Stack, Text, useToast, Container
} from '@chakra-ui/react';
import Link from 'next/link';
import ErrorMessage from '@/components/UI/ErrorMessage'; // Use correct path

const LoginPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginIdentifier, password);
      toast({
        title: 'Login Successful', status: 'success', duration: 3000, isClosable: true,
      });
      const redirectUrl = typeof router.query.redirect === 'string' ? router.query.redirect : '/';
      router.push(redirectUrl);
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        console.error(err);
    }
  };

  return (
    <Container centerContent>
      <Box w="100%" maxW="400px" p={8} mt={10} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="lg" textAlign="center" mb={6}>Login</Heading>
        <ErrorMessage message={error} /> {/* Use ErrorMessage component */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="loginIdentifier" isRequired>
              <FormLabel>Username or Email</FormLabel>
              <Input type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit" colorScheme="teal" isLoading={isLoading} width="full" mt={4}>
              Login
            </Button>
            <Text textAlign="center" mt={2}>
                Don't have an account?{' '}
                <Link href="/auth/register" passHref>
                    <Button variant="link" colorScheme="teal">Register</Button>
                </Link>
            </Text>
          </Stack>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;