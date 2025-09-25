// pages/library/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Box, Heading, Text, Image, Spinner, Center, Tag, Stack, Divider, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, Container } from '@chakra-ui/react';
import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import apiClient from '@/lib/api'; // Adjust path
import { Book } from '@/types/book'; // Adjust path
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path

// Fetch data server-side for better SEO and initial load
export const getServerSideProps: GetServerSideProps<{ book: Book | null; error?: string }> = async (context) => {
  const { id } = context.params ?? {};
  let book: Book | null = null;
  let error: string  = "";
  const bookId = typeof id === 'string' ? parseInt(id, 10) : NaN;

  if (isNaN(bookId)) {
    return { notFound: true }; // Invalid ID format
  }

  try {
    const response = await apiClient.get<Book>(`/books/${bookId}`);
    book = response.data;
    console.log("Fetched book data:", book); // Log the fetched book data
  } catch (err: any) {
    console.error(`GSSP Error fetching book ${bookId}:`, err.response?.status, err.response?.data);
    if (err.response?.status === 404) {
      return { notFound: true }; // Book not found in backend
    }
    error = err.response?.data?.detail || `Failed to load book (ID: ${bookId}).`;
  }

  return {
    props: {
      book, // Will be null if error occurred (except 404)
      error,
    },
  };
};

const BookDetailPage = ({ book, error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  // Show loading spinner if router is not ready yet (though GSSP handles initial load)
  if (router.isFallback || !book && !error) {
    return <Center h="60vh"><Spinner size="xl" /></Center>;
  }

  // Handle error passed from getServerSideProps
  if (error) {
    return (
      <Box p={5}>
         <Heading size="lg" mb={4}>Error</Heading>
         <ErrorMessage message={error} />
         <Link href="/library" passHref>
            <Button mt={4}>Back to Library</Button>
         </Link>
      </Box>
    );
  }

  // Should not happen if GSSP returns notFound, but as a safeguard
  if (!book) {
     return <ErrorMessage message="Book data could not be loaded." />;
  }

  // Format publication date if it exists
  const pubDate = book.publication_date ? new Date(book.publication_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A';

  return (
    <Container maxW="7xl" py={8}>
      <Box>
         {/* Breadcrumbs */}
          <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />} mb={6}>
              <BreadcrumbItem>
                  <Link href="/library" passHref>
                      <BreadcrumbLink>Library</BreadcrumbLink>
                  </Link>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink href={`/library/${book.id}`}>{book.title}</BreadcrumbLink>
              </BreadcrumbItem>
          </Breadcrumb>

        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
         {/* Cover Image */}
          <Box flexShrink={0} w={{ base: '100%', md: '300px' }}>
             <Image
                 src={book.cover_image || 'https://via.placeholder.com/300x400?text=No+Cover'}
                 alt={`${book.title} cover`}
                 width="100%"
                 objectFit="contain"
                 borderRadius="md"
                 boxShadow="md"
                 fallbackSrc='https://via.placeholder.com/300x400?text=No+Cover'
                 bg="gray.100"
             />
          </Box>

         {/* Book Details */}
          <Box flex="1">
             <Heading as="h1" size="xl" mb={2}>{book.title}</Heading>
             <Heading as="h2" size="md" color="gray.600" mb={4}>by {book.author}</Heading>
             <Link href={`/library/edit/${book.id}`} passHref>
                <Button leftIcon={<EditIcon />} size="sm" colorScheme="teal" variant="outline">
                    Edit
                </Button>
             </Link>
             <Stack spacing={3} divider={<Divider />}>
                 {book.isbn && (
                     <Flex justify="space-between">
                         <Text fontWeight="medium" color="gray.500">ISBN:</Text>
                         <Text>{book.isbn}</Text>
                     </Flex>
                 )}
                 <Flex justify="space-between">
                     <Text fontWeight="medium" color="gray.500">Published:</Text>
                     <Text>{pubDate}</Text>
                 </Flex>
                 <Flex justify="space-between">
                     <Text fontWeight="medium" color="gray.500">Added:</Text>
                     <Text>{new Date(book.created_at).toLocaleDateString()}</Text>
                 </Flex>
             </Stack>

             <Heading size="md" mt={8} mb={3}>Description</Heading>
             <Text lineHeight="tall">
                {book.description || <Text as="i" color="gray.500">No description available.</Text>}
             </Text>

             {/* Add Edit/Delete buttons here later if needed and authorized */}
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default BookDetailPage;