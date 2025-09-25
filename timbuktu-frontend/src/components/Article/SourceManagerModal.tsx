// components/Article/SourceManagerModal.tsx
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
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
  Divider
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiExternalLink, FiBook, FiGlobe, FiFileText, FiFile } from 'react-icons/fi';
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

interface SourceManagerModalProps {
  articleId: number;
  articleTitle: string;
  onReferencesChange?: (references: Reference[]) => void;
  onCloseModal?: () => void;
}

const SourceManagerModal: React.FC<SourceManagerModalProps> = ({ 
  articleId, 
  articleTitle, 
  onReferencesChange,
  onCloseModal
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  // Load sources and references
  useEffect(() => {
    loadSources();
    loadReferences();
  }, [articleId]);

  const loadSources = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/sources/`);
      setSources(response.data);
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  const loadReferences = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/articles/${articleTitle}/references`);
      setReferences(response.data);
    } catch (error) {
      console.error('Error loading references:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      if (isEditing && selectedSource) {
        // Update existing source
        await axios.put(`http://localhost:8000/sources/${selectedSource.id}`, formData);
        toast({
          title: 'Source updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new source
        const response = await axios.post('http://localhost:8000/sources/', formData);
        const newSource = response.data;
        
        // Add reference to article
        await axios.post(`http://localhost:8000/sources/articles/${articleId}/references`, {
          source_id: newSource.id,
          reference_number: references.length + 1,
          context: 'Added via source manager',
          page_number: '',
          section: ''
        });
        
        toast({
          title: 'Source added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      await loadSources();
      await loadReferences();
      resetForm();
    } catch (error: any) {
      console.error('Error saving source:', error);
      toast({
        title: 'Error saving source',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
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
    setSelectedSource(null);
    setIsEditing(false);
    setFormErrors({});
  };

  const handleEdit = (source: Source) => {
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
    setSelectedSource(source);
    setIsEditing(true);
  };

  const handleDelete = async (sourceId: number) => {
    if (!window.confirm('Are you sure you want to delete this source?')) return;

    try {
      await axios.delete(`http://localhost:8000/sources/${sourceId}`);
      toast({
        title: 'Source deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadSources();
      await loadReferences();
    } catch (error: any) {
      console.error('Error deleting source:', error);
      toast({
        title: 'Error deleting source',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onCloseModal || (() => {})} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Sources & References</ModalHeader>
          <ModalBody>
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="xl" />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onCloseModal || (() => {})} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text>Manage Sources & References</Text>
            <ModalCloseButton />
          </Flex>
        </ModalHeader>
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Add/Edit Source Form */}
            <Card>
              <CardHeader>
                <Heading size="md">
                  {isEditing ? 'Edit Source' : 'Add New Source'}
                </Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired isInvalid={!!formErrors.title}>
                      <FormLabel>Title</FormLabel>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter source title"
                      />
                      <FormErrorMessage>{formErrors.title}</FormErrorMessage>
                    </FormControl>

                    <HStack spacing={4} width="100%">
                      <FormControl isRequired isInvalid={!!formErrors.source_type}>
                        <FormLabel>Type</FormLabel>
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
                        <FormErrorMessage>{formErrors.source_type}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formErrors.url}>
                        <FormLabel>URL</FormLabel>
                        <Input
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://example.com"
                        />
                        <FormErrorMessage>{formErrors.url}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <HStack spacing={4} width="100%">
                      <FormControl isInvalid={!!formErrors.author}>
                        <FormLabel>Author</FormLabel>
                        <Input
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          placeholder="Author name"
                        />
                        <FormErrorMessage>{formErrors.author}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formErrors.publication}>
                        <FormLabel>Publication</FormLabel>
                        <Input
                          value={formData.publication}
                          onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                          placeholder="Publication name"
                        />
                        <FormErrorMessage>{formErrors.publication}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <HStack spacing={4} width="100%">
                      <FormControl isInvalid={!!formErrors.publication_date}>
                        <FormLabel>Publication Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.publication_date}
                          onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                        />
                        <FormErrorMessage>{formErrors.publication_date}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formErrors.access_date}>
                        <FormLabel>Access Date</FormLabel>
                        <Input
                          type="date"
                          value={formData.access_date}
                          onChange={(e) => setFormData({ ...formData, access_date: e.target.value })}
                        />
                        <FormErrorMessage>{formErrors.access_date}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <HStack spacing={4} width="100%">
                      <FormControl isInvalid={!!formErrors.isbn}>
                        <FormLabel>ISBN</FormLabel>
                        <Input
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                          placeholder="ISBN number"
                        />
                        <FormErrorMessage>{formErrors.isbn}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!formErrors.doi}>
                        <FormLabel>DOI</FormLabel>
                        <Input
                          value={formData.doi}
                          onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                          placeholder="DOI number"
                        />
                        <FormErrorMessage>{formErrors.doi}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <FormControl isInvalid={!!formErrors.description}>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the source"
                        rows={3}
                      />
                      <FormErrorMessage>{formErrors.description}</FormErrorMessage>
                    </FormControl>

                    <HStack spacing={4} width="100%">
                      <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={saving}
                        loadingText="Saving..."
                      >
                        {isEditing ? 'Update' : 'Add'} Source
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            {/* Sources List */}
            <Card>
              <CardHeader>
                <Heading size="md">Sources for this Article</Heading>
              </CardHeader>
              <CardBody>
                {references.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No sources added yet!</AlertTitle>
                    <AlertDescription>
                      Add sources using the form above to create references for this article.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Type</Th>
                        <Th>Title</Th>
                        <Th>Author</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {references.map((reference) => (
                        <Tr key={reference.id}>
                          <Td>{reference.reference_number}</Td>
                          <Td>
                            <HStack>
                              {getSourceIcon(reference.source.source_type)}
                              <Badge colorScheme="blue">
                                {reference.source.source_type}
                              </Badge>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{reference.source.title}</Text>
                            {reference.source.url && (
                              <HStack mt={1}>
                                <FiExternalLink size={12} />
                                <Text fontSize="sm" color="blue.500">
                                  <a href={reference.source.url} target="_blank" rel="noopener noreferrer">
                                    View Source
                                  </a>
                                </Text>
                              </HStack>
                            )}
                          </Td>
                          <Td>{reference.source.author || '-'}</Td>
                          <Td>
                            <HStack>
                              <IconButton
                                aria-label="Edit source"
                                icon={<FiEdit />}
                                size="sm"
                                onClick={() => handleEdit(reference.source)}
                              />
                              <IconButton
                                aria-label="Delete source"
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(reference.source.id)}
                              />
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
        </ModalBody>
        <ModalFooter>
          <Button onClick={onCloseModal || (() => {})}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SourceManagerModal;
