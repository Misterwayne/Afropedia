// components/Article/SourceManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Heading,
  Divider,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiExternalLink, FiBook, FiGlobe, FiFileText, FiFile, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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

interface SourceManagerProps {
  articleId: number;
  articleTitle: string;
  onReferencesChange?: (references: Reference[]) => void;
  onInsertReference?: (referenceNumber: number) => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ 
  articleId, 
  articleTitle, 
  onReferencesChange,
  onInsertReference
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    author: '',
    publication: '',
    publication_date: '',
    access_date: '',
    source_type: 'web',
    isbn: '',
    doi: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [articleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch references for this article
      const response = await axios.get(
        `http://localhost:8000/articles/${articleTitle}/references`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReferences(response.data);
      onReferencesChange?.(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sources and references',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      author: '',
      publication: '',
      publication_date: '',
      access_date: '',
      source_type: 'web',
      isbn: '',
      doi: '',
      description: ''
    });
    setErrors({});
    setSelectedSource(null);
    setIsEditing(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.source_type === 'web' && !formData.url?.trim()) {
      newErrors.url = 'URL is required for web sources';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      if (isEditing && selectedSource) {
        // Update existing source
        await axios.put(
          `http://localhost:8000/sources/${selectedSource.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new source
        const response = await axios.post(
          'http://localhost:8000/sources/',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Automatically create a reference for this article
        await axios.post(
          `http://localhost:8000/sources/articles/${articleId}/references/`,
          {
            article_id: articleId,
            source_id: response.data.id,
            reference_number: references.length + 1,
            context: `Reference to ${formData.title}`,
            page_number: '',
            section: ''
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      toast({
        title: 'Success',
        description: isEditing ? 'Source updated successfully' : 'Source created and referenced',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      resetForm();
      onFormClose();
      fetchData();
    } catch (error) {
      console.error('Error saving source:', error);
      toast({
        title: 'Error',
        description: 'Failed to save source',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (source: Source) => {
    setSelectedSource(source);
    setIsEditing(true);
    setFormData({
      title: source.title,
      url: source.url || '',
      author: source.author || '',
      publication: source.publication || '',
      publication_date: source.publication_date || '',
      access_date: source.access_date || '',
      source_type: source.source_type,
      isbn: source.isbn || '',
      doi: source.doi || '',
      description: source.description || ''
    });
    onFormOpen();
  };

  const handleDelete = async (referenceId: number) => {
    if (!window.confirm('Are you sure you want to delete this reference?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `http://localhost:8000/sources/references/${referenceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Success',
        description: 'Reference deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reference',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInsertReference = (referenceNumber: number) => {
    onInsertReference?.(referenceNumber);
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
    
    if (source.url && source.source_type === 'web') {
      display += `. ${source.url}`;
    }
    
    if (source.isbn && source.source_type === 'book') {
      display += `. ISBN: ${source.isbn}`;
    }
    
    return display;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Add Source Button */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Sources & References</Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => {
                resetForm();
                onFormOpen();
              }}
            >
              Add Source
            </Button>
          </Flex>
        </CardHeader>
      </Card>

      {/* Add/Edit Source Form */}
      <Collapse in={isFormOpen} animateOpacity>
        <Card>
          <CardHeader>
            <Heading size="sm">
              {isEditing ? 'Edit Source' : 'Add New Source'}
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Source title"
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Source Type</FormLabel>
                <Select
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                >
                  <option value="web">Web</option>
                  <option value="book">Book</option>
                  <option value="journal">Journal</option>
                  <option value="newspaper">Newspaper</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl isInvalid={!!errors.url}>
                  <FormLabel>URL {formData.source_type === 'web' && '*'}</FormLabel>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <FormErrorMessage>{errors.url}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Author</FormLabel>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Publication</FormLabel>
                  <Input
                    value={formData.publication}
                    onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                    placeholder="Publisher, Journal, etc."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>ISBN</FormLabel>
                  <Input
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0-123456-78-9"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Publication Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Access Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.access_date}
                    onChange={(e) => setFormData({ ...formData, access_date: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>DOI</FormLabel>
                <Input
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  placeholder="10.1000/182"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes about this source"
                  rows={3}
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={saving}
                  loadingText="Saving..."
                >
                  {isEditing ? 'Update' : 'Add'} Source
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    onFormClose();
                  }}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Collapse>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <Heading size="md">Current References</Heading>
        </CardHeader>
        <CardBody>
          {references.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No sources yet</AlertTitle>
              <AlertDescription>
                Add sources to support the information in this article.
              </AlertDescription>
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Source</Th>
                  <Th>Type</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {references.map((reference) => (
                  <Tr key={reference.id}>
                    <Td>
                      <Badge colorScheme="blue" variant="outline">
                        {reference.reference_number}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {reference.source.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600" noOfLines={2}>
                          {formatSourceDisplay(reference)}
                        </Text>
                        {reference.context && (
                          <Text fontSize="xs" color="gray.500" fontStyle="italic">
                            Context: {reference.context}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <HStack>
                        {getSourceIcon(reference.source.source_type)}
                        <Text fontSize="sm" textTransform="capitalize">
                          {reference.source.source_type}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleInsertReference(reference.reference_number)}
                        >
                          Insert [^{reference.reference_number}]
                        </Button>
                        <IconButton
                          aria-label="Edit source"
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(reference.source)}
                        />
                        <IconButton
                          aria-label="Delete reference"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(reference.id)}
                        />
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
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default SourceManager;