// pages/index.tsx
import { useEffect, useState } from 'react';
import { Box, Heading, List, ListItem, Text, Link as ChakraLink, Flex } from '@chakra-ui/react';
import Link from 'next/link'; // Next.js Link for navigation
import apiClient from '@/lib/api'; // Adjust path
import { ArticleSummary } from '@/types'; // Adjust path
import Spinner from '@/components/UI/Spinner'; // Adjust path
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path

const HomePage = () => {
    const [articles, setArticles] = useState<ArticleSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch the summary list from the backend
                const response = await apiClient.get<ArticleSummary[]>('/articles');
                setArticles(response.data);
            } catch (err: any) {
                console.error("Failed to fetch articles:", err);
                setError(err.response?.data?.message || "Could not load articles.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, []); // Empty dependency array means this runs once on mount

    return (
        <Box>
            <Heading as="h2" size="xl" mb={6}>All Articles</Heading>
            {isLoading && <Flex justify="center" py={10}><Spinner size="xl" /></Flex>}
            <ErrorMessage message={error} />

            {!isLoading && !error && (
                <List spacing={3}>
                    {articles.length > 0 ? (
                        articles.map((article) => (
                            <ListItem key={article.id} p={4} borderWidth="1px" borderRadius="md" _hover={{ bg: 'gray.50' }}>
                                {/* Use Next Link for client-side routing, Chakra Link for styling */}
                                <Link href={`/wiki/${article.title}`} passHref>
                                    <ChakraLink display="block">
                                        <Text fontWeight="bold" fontSize="lg" color="teal.600">
                                            {article.title.replace(/_/g, ' ')} {/* Display title with spaces */}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500" mt={1}>
                                            Last updated: {new Date(article.updatedAt).toLocaleString()}
                                        </Text>
                                    </ChakraLink>
                                </Link>
                            </ListItem>
                        ))
                    ) : (
                        <Text>No articles found. Why not create one?</Text>
                    )}
                </List>
            )}
        </Box>
    );
};

export default HomePage;