// pages/library/add.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, useToast, Flex, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth'; // Import if adding books requires login
import apiClient from '@/lib/api'; // Adjust path
import BookCreateForm, { BookFormData } from '@/components/Book/BookCreateForm'; // Adjust path
import Spinner from '@/components/UI/Spinner'; // Adjust path
import { Book } from '@/types/book'; // Import Book type for response

const AddBookPage = () => {
  // --- Uncomment this section if adding books requires authentication ---
  const { isAuthenticated, isAuthCheckComplete } = useRequireAuth();
  // --- End Auth Section ---

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  // Function to handle the actual API call
  const handleCreateBook = async (data: BookFormData) => {
    setIsSubmitting(true);
    setApiError(null);
    console.log("Submitting book data:", data); // Log data being sent

    try {
      const response = await apiClient.post<Book>('/books/', data); // Send data as JSON payload

      toast({
        title: 'Book Added!',
        description: `"${response.data.title}" by ${response.data.author} added successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      // Redirect to the newly created book's detail page
      router.push(`/library/${response.data.id}`);

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to add book. Please check the details and try again.';
      setApiError(errorMessage); // Set error to display in the form component
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
      console.error('Book creation failed:', error.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---

  // Optional: Loading state while checking authentication
  if (!isAuthCheckComplete) {
    return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>;
  }

  // Optional: Redirect or show message if user is not authenticated
  if (!isAuthenticated) {
     // You could redirect using router.push('/auth/login?redirect=/library/add')
     return <Text p={5}>You must be logged in to add books.</Text>;
  }

  return (
    <Box>
       {/* Breadcrumbs */}
        <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />} mb={6}>
            <BreadcrumbItem>
                <Link href="/library" passHref>
                    <BreadcrumbLink>Library</BreadcrumbLink>
                </Link>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href="/library/add">Add New Book</BreadcrumbLink>
            </BreadcrumbItem>
        </Breadcrumb>

      <Heading as="h1" size="xl" mb={6}>Add New Book</Heading>

      <BookCreateForm
        onSubmit={handleCreateBook}
        isLoading={isSubmitting}
        apiError={apiError}
      />
    </Box>
  );
};

export default AddBookPage;