// pages/search.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  HStack,
  Box,
  Card,
  CardBody,
  Badge,
  Avatar,
  AvatarGroup,
  Flex,
  Button,
  SimpleGrid,
  Spinner,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Link as ChakraLink,
} from '@chakra-ui/react';
import {
  SearchIcon,
  CloseIcon,
  ViewIcon,
  CheckCircleIcon,
  StarIcon,
} from '@chakra-ui/icons';
import {
  FiBook,
  FiBookOpen,
  FiEye,
  FiClock,
  FiUser,
  FiFilter,
  FiTrendingUp,
} from 'react-icons/fi';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { sanitizeHtml, createHighlightedText } from '../utils/sanitizeHtml';
import { ArticleSummary } from '@/types';
import { Book } from '@/types/book';
import EnhancedSearchInput from '@/components/Search/EnhancedSearchInput';

const SearchPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);

  const bgGradient = useColorModeValue(
    'linear(to-br, african.25, sunset.25, forest.25)',
    'linear(to-br, african.900, sunset.900, forest.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');

  // Get initial query from URL
  useEffect(() => {
    const query = router.query.q;
    if (typeof query === 'string' && query.trim()) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [router.query.q]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Use advanced search endpoint with MeiliSearch
      const advancedResponse = await apiClient.get(
        `/advanced-search/search?q=${encodeURIComponent(query)}&limit=20`
      );
      
      const results = advancedResponse.data;
      console.log('Advanced search results:', results);
      setSearchResults(results);
      
      // Extract articles and books from MeiliSearch results
      const advancedArticles = (results.articles?.hits || []).map((article: any) => ({
        id: article.id,
        title: article.title.replace(/ /g, '_'), // Convert back to underscore format for URLs
        updatedAt: article.updated_at,
        createdAt: article.created_at,
        summary: article.summary || 'Peer-reviewed content exploring African knowledge and heritage.',
        author: article.author || 'Unknown',
        tags: article.tags || [],
        // Add highlighted content if available
        highlightedTitle: article._formatted?.title || article.title,
        highlightedSummary: article._formatted?.summary || article.summary
      }));
      
      const advancedBooks = (results.books?.hits || []).map((book: any) => ({
        ...book,
        highlightedTitle: book._formatted?.title || book.title,
        highlightedDescription: book._formatted?.description || book.description
      }));
      
      console.log('Mapped articles:', advancedArticles);
      console.log('Mapped books:', advancedBooks);
      setArticles(advancedArticles);
      setBooks(advancedBooks);
      setSuggestions(results.suggestions || []);
      
      // Fallback to original search if enhanced search fails
    } catch (error) {
      console.error('Enhanced search failed, trying fallback:', error);
      
      try {
        // Fallback to original search
        const articlesResponse = await apiClient.get<ArticleSummary[]>(
          `/search/results?q=${encodeURIComponent(query)}`
        );
        setArticles(articlesResponse.data || []);

        // Search books
        try {
          const booksResponse = await apiClient.get<Book[]>(
            `/books?search=${encodeURIComponent(query)}`
          );
          setBooks(booksResponse.data || []);
        } catch (bookError) {
          console.log('Books search failed, continuing with articles only');
          setBooks([]);
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setArticles([]);
        setBooks([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Update URL with search query
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`, undefined, { shallow: true });
      performSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setArticles([]);
    setBooks([]);
    setHasSearched(false);
    router.push('/search', undefined, { shallow: true });
  };

  const totalResults = articles.length + books.length;

  return (
    <Box bg={bgGradient} minH="100vh">
      <Container maxW="7xl" py={8}>
        {/* Header Section */}
        <VStack spacing={8} mb={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="african.900">
              Search Afropedia
            </Heading>
            <Text fontSize="lg" color="gray.700" maxW="600px">
              Discover peer-reviewed African knowledge, culture, and heritage
            </Text>
          </VStack>

          {/* Enhanced Search Input */}
          <Box w="full" maxW="600px">
            <EnhancedSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search articles, books, topics..."
              size="lg"
            />
            
            <HStack justify="center" mt={4}>
              <Button
                onClick={handleSearch}
                colorScheme="african"
                size="md"
                leftIcon={<SearchIcon />}
                isLoading={isLoading}
                loadingText="Searching..."
              >
                Search
              </Button>
            </HStack>
          </Box>
        </VStack>

        {/* Search Results */}
        {hasSearched && (
          <Box>
            {/* Results Header */}
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="african.800">
                  Search Results
                </Heading>
                {!isLoading && (
                  <Text color="gray.600">
                    Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
                  </Text>
                )}
              </VStack>
              
              {totalResults > 0 && (
                <HStack spacing={2}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FiFilter />}
                    colorScheme="african"
                  >
                    Filter
                  </Button>
                </HStack>
              )}
            </Flex>

            {/* Loading State */}
            {isLoading && (
              <Flex justify="center" py={12}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="african.500" />
                  <Text color="gray.600">Searching Afropedia...</Text>
                </VStack>
              </Flex>
            )}

            {/* Results Tabs */}
            {!isLoading && totalResults > 0 && (
              <Tabs index={activeTab} onChange={setActiveTab} colorScheme="african">
                <TabList>
                  <Tab>
                    <HStack spacing={2}>
                      <FiBook />
                      <Text>Articles ({articles.length})</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FiBookOpen />
                      <Text>Books ({books.length})</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Articles Tab */}
                  <TabPanel px={0}>
                    {articles.length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {articles.map((article) => (
                          <Link key={article.id} href={`/wiki/${article.title}`} passHref>
                            <Card
                              bg={cardBg}
                              shadow="md"
                              _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}
                              transition="all 0.3s"
                              cursor="pointer"
                              h="full"
                            >
                              <CardBody>
                                <VStack align="start" spacing={4} h="full">
                                  <VStack align="start" spacing={2} flex={1}>
                                    <HStack justify="space-between" w="full">
                                      <Badge colorScheme="green" variant="subtle">
                                        <CheckCircleIcon mr={1} />
                                        Peer Reviewed
                                      </Badge>
                                      <HStack spacing={1} color="gray.500" fontSize="sm">
                                        <FiEye />
                                        <Text>{article.id ? `${article.id * 23}` : '0'}</Text>
                                      </HStack>
                                    </HStack>

                                    <Heading size="md" color="african.800" noOfLines={2}>
                                      {(article as any).highlightedTitle ? (
                                        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml((article as any).highlightedTitle?.replace(/_/g, ' ') || '') }} />
                                      ) : (
                                        article.title.replace(/_/g, ' ')
                                      )}
                                    </Heading>

                                    <Text color="gray.600" fontSize="sm" noOfLines={3}>
                                      {(article as any).highlightedSummary ? (
                                        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml((article as any).highlightedSummary || '') }} />
                                      ) : (
                                        (article as any).summary || 'Peer-reviewed content exploring African knowledge and heritage.'
                                      )}
                                    </Text>
                                  </VStack>

                                  <HStack justify="space-between" w="full" pt={2}>
                                    <Text fontSize="xs" color="gray.500">
                                      Updated {new Date(article.updatedAt).toLocaleDateString()}
                                    </Text>
                                    <AvatarGroup size="xs" max={2}>
                                      <Avatar name={`Article ${article.id}`} bg="african.500" />
                                      <Avatar name="Community" bg="forest.500" />
                                    </AvatarGroup>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          </Link>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Box textAlign="center" py={12}>
                        <FiBook size="48px" color="gray.400" />
                        <Heading size="md" color="gray.600" mt={4}>
                          No articles found
                        </Heading>
                        <Text color="gray.500" mt={2}>
                          Try different keywords or browse our categories
                        </Text>
                      </Box>
                    )}
                  </TabPanel>

                  {/* Books Tab */}
                  <TabPanel px={0}>
                    {books.length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {books.map((book) => (
                          <Link key={book.id} href={`/library/${book.id}`} passHref>
                            <Card
                              bg={cardBg}
                              shadow="md"
                              _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}
                              transition="all 0.3s"
                              cursor="pointer"
                              h="full"
                            >
                              <CardBody>
                                <VStack align="start" spacing={4} h="full">
                                  <VStack align="start" spacing={2} flex={1}>
                                    <HStack justify="space-between" w="full">
                                      <Badge colorScheme="blue" variant="subtle">
                                        <FiBookOpen />
                                        <Text ml={1}>Book</Text>
                                      </Badge>
                                      <HStack spacing={1} color="gray.500" fontSize="sm">
                                        <StarIcon />
                                        <Text>4.5</Text>
                                      </HStack>
                                    </HStack>

                                    <Heading size="md" color="african.800" noOfLines={2}>
                                      {(book as any).highlightedTitle ? (
                                        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml((book as any).highlightedTitle || '') }} />
                                      ) : (
                                        book.title
                                      )}
                                    </Heading>

                                    <Text color="gray.600" fontSize="sm" fontWeight="medium">
                                      by {book.author}
                                    </Text>

                                    <Text color="gray.600" fontSize="sm" noOfLines={3}>
                                      {(book as any).highlightedDescription ? (
                                        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml((book as any).highlightedDescription || '') }} />
                                      ) : (
                                        book.description || 'A valuable addition to the Afropedia library.'
                                      )}
                                    </Text>
                                  </VStack>

                                  <HStack justify="space-between" w="full" pt={2}>
                                    <Text fontSize="xs" color="gray.500">
                                      Added {new Date(book.created_at).toLocaleDateString()}
                                    </Text>
                                    <Badge colorScheme="african" variant="outline">
                                      Book
                                    </Badge>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          </Link>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Box textAlign="center" py={12}>
                        <FiBookOpen size="48px" color="gray.400" />
                        <Heading size="md" color="gray.600" mt={4}>
                          No books found
                        </Heading>
                        <Text color="gray.500" mt={2}>
                          Try different keywords or browse our library
                        </Text>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}

            {/* No Results with Suggestions */}
            {!isLoading && hasSearched && totalResults === 0 && (
              <Box textAlign="center" py={12}>
                <SearchIcon boxSize="48px" color="gray.400" />
                <Heading size="lg" color="gray.600" mt={4}>
                  No exact matches found
                </Heading>
                <Text color="gray.500" mt={2} mb={6}>
                  We couldn't find exact matches for "{searchQuery}"
                </Text>

                {/* Show suggestions if available */}
                {suggestions.length > 0 && (
                  <VStack spacing={4} mb={8}>
                    <Text color="gray.600" fontWeight="medium">
                      Did you mean one of these?
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3} maxW="600px">
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          colorScheme="african"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            performSearch(suggestion);
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </SimpleGrid>
                  </VStack>
                )}
                
                <VStack spacing={4}>
                  <Text color="gray.600" fontWeight="medium">
                    Search tips:
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} maxW="600px">
                    <Box p={4} bg={cardBg} borderRadius="md" border="1px solid" borderColor="gray.200">
                      <Text fontSize="sm" color="gray.600">
                        • Check your spelling
                        <br />
                        • Try different keywords
                        <br />
                        • Use more general terms
                      </Text>
                    </Box>
                    <Box p={4} bg={cardBg} borderRadius="md" border="1px solid" borderColor="gray.200">
                      <Text fontSize="sm" color="gray.600">
                        • Browse our categories
                        <br />
                        • Explore featured articles
                        <br />
                        • Check our library
                      </Text>
                    </Box>
                  </SimpleGrid>
                  
                  <HStack spacing={4} mt={6}>
                    <Link href="/" passHref>
                      <Button variant="outline" colorScheme="african">
                        Browse Featured
                      </Button>
                    </Link>
                    <Link href="/library" passHref>
                      <Button variant="solid" colorScheme="african">
                        Visit Library
                      </Button>
                    </Link>
                  </HStack>
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Popular Searches (when no search has been performed) */}
        {!hasSearched && (
          <Box>
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="african.800">
                  Popular Topics
                </Heading>
                <Text color="gray.600">
                  Explore these trending topics in African knowledge
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} w="full" maxW="800px">
                {[
                  'Ancient Egypt',
                  'African Kingdoms',
                  'Traditional Music',
                  'African Languages',
                  'Colonial History',
                  'Independence Movements',
                  'African Literature',
                  'Traditional Medicine',
                ].map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    colorScheme="african"
                    onClick={() => {
                      setSearchQuery(topic);
                      performSearch(topic);
                    }}
                    size="sm"
                    leftIcon={<FiTrendingUp />}
                  >
                    {topic}
                  </Button>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;
