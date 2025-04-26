// pages/library/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Input, InputGroup, InputLeftElement, Flex, IconButton, Link, Button, VStack } from '@chakra-ui/react';
import { SearchIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import apiClient from '@/lib/api'; // Adjust path
import { Book } from '@/types/book'; // Adjust path
import BookList from '@/components/Book/BookList'; // Adjust path
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path
import useDebounce  from '@/hooks/useDebounce'; // Adjust path
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const LibraryPage = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const {isAuthenticated, isAuthCheckComplete} = useRequireAuth(); // Replace with actual authentication check
    const debouncedSearchTerm = useDebounce(searchTerm, 400); // Debounce search input

    const fetchBooks = useCallback(async (query: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Construct query params, only add 'search' if it has value
            const params = new URLSearchParams();
            if (query) {
                params.append('search', query);
            }
            // Add pagination params later if needed
            // params.append('skip', '0');
            // params.append('limit', '50');

            const response = await apiClient.get<Book[]>(`/books?${params.toString()}`);
            setBooks(response.data);
        } catch (err: any) {
            console.error("Failed to fetch books:", err);
            setError(err.response?.data?.detail || "Could not load the library.");
            setBooks([]); // Clear books on error
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback dependency array is empty

    // Fetch books on initial load and when debounced search term changes
    useEffect(() => {
        fetchBooks(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchBooks]);

    const handleClearSearch = () => {
        setSearchTerm('');
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={6} wrap="wrap">
                <VStack spacing={4} align="flex-start">

                 <Heading as="h1" size="xl" mb={{base: 4, md: 0}}>
                    Book Library
                 </Heading>
                 {isAuthenticated && (
                     <Link href="/library/add">
                              <Button leftIcon={<AddIcon />} w="full" colorScheme="black" variant="ghost" my={1}>Add Book</Button>
                          </Link>
                    )}
                </VStack>
                 {/* Search Input */}
                 <InputGroup maxW={{base: "100%", md: "300px"}}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search title, author, desc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg="white"
                    />
                    {searchTerm && (
                         <IconButton
                            aria-label="Clear search"
                            icon={<CloseIcon />}
                            size="sm"
                            position="absolute"
                            right="0.5rem"
                            top="50%"
                            transform="translateY(-50%)"
                            variant="ghost"
                            onClick={handleClearSearch}
                         />
                    )}
                 </InputGroup>
            </Flex>

            <ErrorMessage message={error} />

            {/* Pass loading state to BookList for skeleton UI */}
            <BookList books={books} isLoading={isLoading} />

            {/* Add Pagination controls here later */}

        </Box>
    );
};

export default LibraryPage;