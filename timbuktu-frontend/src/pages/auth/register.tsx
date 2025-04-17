// pages/auth/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
 import {
  Box, Button, FormControl, FormLabel, Input, Heading, Stack, Text, useToast, Container
} from '@chakra-ui/react';
import Link from 'next/link';
import ErrorMessage from '@/components/UI/ErrorMessage'; // Use correct path

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);
     if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
     }
     try {
       await register(username, email, password);
       toast({
         title: 'Registration Successful', description: "You can now log in.", status: 'success', duration: 3000, isClosable: true,
       });
       router.push('/auth/login');
     } catch (err: any) {
       const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
       setError(errorMessage);
       console.error(err);
     }
   };

   return (
      <Container centerContent>
        <Box w="100%" maxW="400px" p={8} mt={10} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <Heading as="h1" size="lg" textAlign="center" mb={6}>Register</Heading>
          <ErrorMessage message={error} /> {/* Use ErrorMessage component */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
               <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} />
              </FormControl>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                 <Text fontSize="sm" color="gray.500">Minimum 8 characters</Text>
              </FormControl>
              <Button type="submit" colorScheme="teal" isLoading={isLoading} width="full" mt={4}>
                Register
              </Button>
               <Text textAlign="center" mt={2}>
                Already have an account?{' '}
                <Link href="/auth/login" passHref>
                    <Button variant="link" colorScheme="teal">Login</Button>
                </Link>
            </Text>
            </Stack>
          </form>
        </Box>
      </Container>
   );
};

export default RegisterPage;