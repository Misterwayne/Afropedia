// components/Book/BookList.tsx
import React from 'react';
import { Box, VStack, Text, Link as ChakraLink, Heading, Image, Flex, SimpleGrid, Tag, Skeleton, SkeletonText } from '@chakra-ui/react';
import Link from 'next/link'; // Next.js Link
import { Book } from '@/types/book'; // Adjust import path

interface BookListProps {
  books: Book[];
  isLoading?: boolean; // Optional loading state for skeleton UI
  itemsToShow?: number; // Optional limit for skeleton items
}

const BookList: React.FC<BookListProps> = ({ books, isLoading = false, itemsToShow = 6 }) => {
  if (isLoading) {
     // Render Skeleton Loading state
     return (
         <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
             {Array.from({ length: itemsToShow }).map((_, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
                     <Skeleton height="150px" mb={4} borderRadius="md"/>
                     <Skeleton height="20px" width="80%" mb={2} />
                     <Skeleton height="16px" width="60%" mb={4}/>
                     <SkeletonText noOfLines={3} spacing="3" />
                </Box>
             ))}
         </SimpleGrid>
     )
  }

  if (!books || books.length === 0) {
    return <Text>No books found in the library.</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {books.map((book) => (
        <Box key={book.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" transition="all 0.2s" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)'}}>
            <Link href={`/library/${book.id}`} passHref>
                <ChakraLink display="block" _hover={{textDecoration: 'none'}}>
                    {/* Cover Image */}
                     <Image
                         src={book.cover_image || 'https://via.placeholder.com/150x200?text=No+Cover'} // Placeholder
                         alt={`${book.title} cover`}
                         height="200px" // Fixed height for consistency
                         width="100%"
                         objectFit="contain" // Use contain to see whole cover, or cover to fill
                         mb={4}
                         borderRadius="md"
                         fallbackSrc='https://via.placeholder.com/150x200?text=No+Cover'
                         bg="gray.100" // Background for placeholder/fallback
                     />
                    {/* Metadata */}
                     <Heading size="sm" noOfLines={2} mb={1} title={book.title}>
                        {book.title}
                     </Heading>
                     <Text fontSize="sm" color="gray.600" noOfLines={1} mb={2}>
                        by {book.author}
                     </Text>
                     {book.publication_date && (
                         <Tag size="sm" colorScheme="teal" variant="subtle" mb={2}>
                             {new Date(book.publication_date).getFullYear()} {/* Display year */}
                         </Tag>
                     )}
                     <Text fontSize="xs" color="gray.500" noOfLines={3}>
                        {book.description || "No description available."}
                     </Text>
                </ChakraLink>
            </Link>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default BookList;