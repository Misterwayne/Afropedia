// pages/library/edit/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Box, Heading, useToast, Flex, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Center, Spinner } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth'; // Import if editing requires login
import apiClient from '@/lib/api'; // Adjust path
import BookCreateForm, { BookFormData } from '@/components/Book/BookCreateForm'; // Adjust path
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path
import { Book } from '@/types/book'; // Adjust path
import { SubmitHandler } from 'react-hook-form';

// Fetch data server-side for initial load
export const getServerSideProps: GetServerSideProps<{ book: Book | null; error?: string | null}> = async (context) => {
  const { id } = context.params ?? {};
  let book: Book | null = null;
  let error: string | null = null;
  const bookId = typeof id === 'string' ? parseInt(id, 10) : NaN;

  if (isNaN(bookId)) {
    return { notFound: true }; // Invalid ID format
  }

  try {
     console.log(`[GSSP Edit Book] Fetching book ID: ${bookId}`);
    // Use the same endpoint as the detail page
    const response = await apiClient.get<Book>(`/books/${bookId}`);
    book = response.data;
    console.log(`[GSSP Edit Book] Fetched book: ${book?.title}`);
  } catch (err: any) {
    console.error(`[GSSP Edit Book] Error fetching book ${bookId}:`, err.response?.status, err.response?.data);
    if (err.response?.status === 404) {
      return { notFound: true };
    }
    error = err.response?.data?.detail || `Failed to load book data for editing (ID: ${bookId}).`;
  }

  return {
    props: {
      book, // Pass fetched book data or null
      error,
    },
  };
};


const EditBookPage = ({ book, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // --- Optional Auth Check ---
   // const { isAuthenticated, isAuthCheckComplete } = useRequireAuth('/auth/login'); // Redirect if not logged in
   const isAuthCheckComplete = true; // Placeholder
   const isAuthenticated = true;    // Placeholder
  // --- End Auth Check ---

  const router = useRouter();
  const { id: bookId } = router.query; // Get ID from router query as well
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(initialError || null); // Initialize with GSSP error if any

  // Function to handle the PATCH request for updates
  const handleUpdateBook: SubmitHandler<BookFormData> = async (data) => {
    if (!bookId || typeof bookId !== 'string') {
        setApiError("Book ID is missing or invalid.");
        return;
    }
    setIsSubmitting(true);
    setApiError(null);
    console.log("Submitting update data:", data);

    try {
        // Send PATCH request to the specific book's endpoint
      const response = await apiClient.patch<Book>(`/books/${bookId}`, data);

      toast({
        title: 'Book Updated!',
        description: `"${response.data.title}" updated successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      // Redirect back to the book's detail page
      router.push(`/library/${bookId}`);

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update book. Please check the details and try again.';
      setApiError(errorMessage); // Show error within the form
      toast({
        title: 'Update Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
      console.error('Book update failed:', error.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---

   // Show loading spinner while checking auth (if implemented)
   if (!isAuthCheckComplete) {
       return <Center h="60vh"><Spinner size="xl" /></Center>;
   }
   // Optional: Show message or redirect if not authenticated
   if (!isAuthenticated) {
       return <Text p={5}>You must be logged in to edit books.</Text>;
   }

   // Handle errors during server-side fetch
   if (initialError || !book) {
     return (
       <Box p={5}>
          <Heading size="lg" mb={4}>Error Loading Book</Heading>
          <ErrorMessage message={initialError || `Could not load book data for ID ${bookId}.`} />
          <Link href="/library" passHref>
             <Button mt={4}>Back to Library</Button>
          </Link>
       </Box>
     );
   }


  return (
    <Box>
      {/* Breadcrumbs */}
       <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />} mb={6}>
           <BreadcrumbItem>
               <Link href="/library" passHref><BreadcrumbLink>Library</BreadcrumbLink></Link>
           </BreadcrumbItem>
            <BreadcrumbItem>
                <Link href={`/library/${book.id}`} passHref><BreadcrumbLink>{book.title}</BreadcrumbLink></Link>
            </BreadcrumbItem>
           <BreadcrumbItem isCurrentPage>
               <BreadcrumbLink href={`/library/edit/${book.id}`}>Edit</BreadcrumbLink>
           </BreadcrumbItem>
       </Breadcrumb>

      <Heading as="h1" size="xl" mb={6}>Edit Book: {book.title}</Heading>

      {/* Render the form in edit mode, passing initial data */}
      <BookCreateForm
        onSubmit={handleUpdateBook}
        isLoading={isSubmitting}
        apiError={apiError}
        isEditMode={true} // <<< Set edit mode
        defaultValues={book} // <<< Pass fetched book data as defaultValues
      />
    </Box>
  );
};

export default EditBookPage;