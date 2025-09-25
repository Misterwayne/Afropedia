// components/Article/ReferencesSection.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Link,
  Badge,
  useColorModeValue,
  Collapse,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FiExternalLink, FiBook, FiGlobe, FiFileText, FiFile, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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

interface ReferencesSectionProps {
  articleTitle: string;
  showTitle?: boolean;
  maxHeight?: string;
}

const ReferencesSection: React.FC<ReferencesSectionProps> = ({ 
  articleTitle, 
  showTitle = true,
  maxHeight = "400px"
}) => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  useEffect(() => {
    fetchReferences();
  }, [articleTitle]);

  const fetchReferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:8000/articles/${articleTitle}/references`
      );
      
      setReferences(response.data);
    } catch (err) {
      console.error('Error fetching references:', err);
      setError('Failed to load references');
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

  const formatReference = (reference: Reference) => {
    const source = reference.source;
    let formatted = '';
    
    // Author
    if (source.author) {
      formatted += `${source.author}. `;
    }
    
    // Title
    formatted += `"${source.title}"`;
    
    // Publication
    if (source.publication) {
      formatted += `. ${source.publication}`;
    }
    
    // Publication date
    if (source.publication_date) {
      const date = new Date(source.publication_date);
      formatted += `. ${date.getFullYear()}`;
    }
    
    // URL for web sources
    if (source.url && source.source_type === 'web') {
      formatted += `. ${source.url}`;
    }
    
    // ISBN for books
    if (source.isbn && source.source_type === 'book') {
      formatted += `. ISBN: ${source.isbn}`;
    }
    
    // DOI for journals
    if (source.doi && source.source_type === 'journal') {
      formatted += `. DOI: ${source.doi}`;
    }
    
    // Access date for web sources
    if (source.access_date && source.source_type === 'web') {
      const accessDate = new Date(source.access_date);
      formatted += `. Accessed: ${accessDate.toLocaleDateString()}`;
    }
    
    return formatted;
  };

  const getReferenceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'web': return 'blue';
      case 'book': return 'green';
      case 'journal': return 'purple';
      case 'newspaper': return 'orange';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100px">
        <Spinner size="md" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading references</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (references.length === 0) {
    return null; // Don't show anything if no references
  }

  return (
    <Card bg={bgColor} borderColor={borderColor} mt={6}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {showTitle && (
            <>
              <HStack justify="space-between" align="center">
                <Heading size="md" color="blue.600">
                  References
                </Heading>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" variant="outline">
                    {references.length} source{references.length !== 1 ? 's' : ''}
                  </Badge>
                  {references.length > 3 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      rightIcon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? 'Show Less' : 'Show All'}
                    </Button>
                  )}
                </HStack>
              </HStack>
              <Divider />
            </>
          )}

          <Box
            maxH={isExpanded ? "none" : maxHeight}
            overflowY={isExpanded ? "visible" : "auto"}
          >
            <VStack spacing={3} align="stretch">
              {references.map((reference) => (
                <Box key={reference.id} p={3} bg="gray.50" borderRadius="md">
                  <HStack align="start" spacing={3}>
                    <Badge
                      colorScheme={getReferenceColor(reference.source.source_type)}
                      variant="solid"
                      minW="30px"
                      textAlign="center"
                    >
                      {reference.reference_number}
                    </Badge>
                    
                    <VStack align="start" spacing={1} flex="1">
                      <HStack spacing={2} align="center">
                        {getSourceIcon(reference.source.source_type)}
                        <Text fontSize="sm" fontWeight="medium" color={textColor}>
                          {reference.source.title}
                        </Text>
                        {reference.source.url && (
                          <Tooltip label="Open source">
                            <IconButton
                              aria-label="Open source"
                              icon={<FiExternalLink />}
                              size="xs"
                              variant="ghost"
                              onClick={() => window.open(reference.source.url, '_blank')}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                      
                      <Text fontSize="sm" color={textColor} lineHeight="1.4">
                        {formatReference(reference)}
                      </Text>
                      
                      {reference.context && (
                        <Text fontSize="xs" color="gray.500" fontStyle="italic">
                          Context: {reference.context}
                        </Text>
                      )}
                      
                      {reference.page_number && (
                        <Text fontSize="xs" color="gray.500">
                          Page: {reference.page_number}
                        </Text>
                      )}
                      
                      {reference.section && (
                        <Text fontSize="xs" color="gray.500">
                          Section: {reference.section}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ReferencesSection;
