// components/Article/ArticleSources.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Heading,
  Divider,
  Link
} from '@chakra-ui/react';
import { FiExternalLink, FiBook, FiGlobe, FiFileText, FiFile } from 'react-icons/fi';
import axios from 'axios';

interface Source {
  id: number;
  title: string;
  url?: string;
  author?: string;
  publication?: string;
  publication_date?: string;
  access_date?: string;
  source_type: string;
  isbn?: string;
  doi?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

interface Reference {
  id: number;
  article_id: number;
  source_id: number;
  reference_number: number;
  context?: string;
  page_number?: string;
  section?: string;
  created_at: string;
  created_by?: number;
  source: Source;
}

interface ArticleSourcesProps {
  articleTitle: string;
  showTitle?: boolean;
}

const ArticleSources: React.FC<ArticleSourcesProps> = ({ 
  articleTitle, 
  showTitle = true 
}) => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferences();
  }, [articleTitle]);

  const loadReferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(
        `http://localhost:8000/articles/${articleTitle}/references`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReferences(response.data);
    } catch (error: any) {
      console.error('Error loading references:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load sources and references');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'web': return <FiGlobe />;
      case 'book': return <FiBook />;
      case 'journal': return <FiFileText />;
      case 'newspaper': return <FiFile />;
      default: return <FiFileText />;
    }
  };

  const formatSourceDisplay = (reference: Reference) => {
    const source = reference.source;
    let display = '';
    
    if (source.author) {
      display += `${source.author}. `;
    }
    
    display += `"${source.title}"`;
    
    if (source.publication) {
      display += `. ${source.publication}`;
    }
    
    if (source.publication_date) {
      const date = new Date(source.publication_date).toLocaleDateString();
      display += ` (${date})`;
    }
    
    if (source.url && source.source_type === 'web') {
      display += `. Available at: ${source.url}`;
    }
    
    if (source.isbn && source.source_type === 'book') {
      display += `. ISBN: ${source.isbn}`;
    }
    
    if (source.doi) {
      display += `. DOI: ${source.doi}`;
    }
    
    if (source.access_date) {
      const accessDate = new Date(source.access_date).toLocaleDateString();
      display += `. Accessed: ${accessDate}`;
    }
    
    return display;
  };

  if (loading) {
    return (
      <Box mt={8}>
        <Flex justify="center" align="center" minH="100px">
          <Spinner size="md" />
        </Flex>
      </Box>
    );
  }


  if (error) {
    return (
      <Box mt={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error loading sources</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (references.length === 0) {
    return null; // Don't show anything if no sources
  }

  return (
    <Box mt={8}>
      <Divider mb={4} />
      
      {showTitle && (
        <Heading size="md" color="gray.700" mb={4}>
          References
        </Heading>
      )}

      <VStack spacing={3} align="stretch">
        {references.map((reference) => (
            <Box
              key={reference.id}
              id={`ref-${reference.reference_number}`}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
              _hover={{ bg: "gray.100" }}
            >
              <HStack spacing={3} align="start">
                <Badge colorScheme="blue" variant="outline" minW="fit-content">
                  <Link href={`#ref-link-${reference.reference_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {reference.reference_number}
                  </Link>
                </Badge>
                
                <VStack align="start" spacing={1} flex={1}>
                  <HStack spacing={2}>
                    {getSourceIcon(reference.source.source_type)}
                    <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
                      {reference.source.source_type}
                    </Text>
                  </HStack>
                  
                  <Text fontSize="sm" lineHeight="1.4">
                    {formatSourceDisplay(reference)}
                  </Text>
                  
                  {reference.context && (
                    <Text fontSize="xs" color="gray.600" fontStyle="italic">
                      Context: {reference.context}
                    </Text>
                  )}
                  
                  {reference.page_number && (
                    <Text fontSize="xs" color="gray.600">
                      Page: {reference.page_number}
                    </Text>
                  )}
                  
                  {reference.section && (
                    <Text fontSize="xs" color="gray.600">
                      Section: {reference.section}
                    </Text>
                  )}
                </VStack>
                
                {reference.source.url && (
                  <IconButton
                    aria-label="Open source"
                    icon={<FiExternalLink />}
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(reference.source.url, '_blank')}
                  />
                )}
              </HStack>
            </Box>
          ))}
      </VStack>
    </Box>
  );
};

export default ArticleSources;
