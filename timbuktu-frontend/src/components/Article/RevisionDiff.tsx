// components/Article/RevisionDiff.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Alert,
  AlertIcon,
  Code,
  AlertTitle,
  AlertDescription,
  Spinner,
  Flex
} from '@chakra-ui/react';
import axios from 'axios';

interface RevisionDiffProps {
  revisionId: number;
  articleTitle: string;
}

interface DiffData {
  revision_id: number;
  is_first_revision: boolean;
  current_content: string;
  previous_content: string | null;
  current_revision: {
    id: number;
    timestamp: string;
    comment: string;
    user_id: number;
  };
  previous_revision: {
    id: number;
    timestamp: string;
    comment: string;
    user_id: number;
  } | null;
  diff: {
    line_diff: string[];
    word_diff: string[];
    char_diff: string[];
    statistics: {
      added_lines: number;
      removed_lines: number;
      total_lines_old: number;
      total_lines_new: number;
      added_words: number;
      removed_words: number;
      total_words_old: number;
      total_words_new: number;
      added_chars: number;
      removed_chars: number;
      total_chars_old: number;
      total_chars_new: number;
    };
    summary: {
      has_changes: boolean;
      change_type: 'major' | 'minor' | 'none';
      net_change: number;
    };
  } | null;
  message?: string;
}

const RevisionDiff: React.FC<RevisionDiffProps> = ({ revisionId, articleTitle }) => {
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchDiffData();
  }, [revisionId, articleTitle]);

  const fetchDiffData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:8000/articles/${articleTitle}/revisions/${revisionId}/diff`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setDiffData(response.data);
    } catch (err: any) {
      console.error('Error fetching diff data:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to load revision changes: ${err.response?.data?.error?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading changes</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!diffData) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>No changes found</AlertTitle>
        <AlertDescription>Unable to load revision changes.</AlertDescription>
      </Alert>
    );
  }

  if (diffData.is_first_revision) {
    return (
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="blue.600">
            First Revision
          </Heading>
        </CardHeader>
        <CardBody>
          <Text>{diffData.message}</Text>
          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="bold" mb={2}>Content:</Text>
            <Code p={2} display="block" whiteSpace="pre-wrap">
              {diffData.current_content}
            </Code>
          </Box>
        </CardBody>
      </Card>
    );
  }


  if (!diffData.diff) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>No diff data available</AlertTitle>
        <AlertDescription>Unable to generate diff for this revision.</AlertDescription>
      </Alert>
    );
  }

  // Access properties directly from diffData.diff
  const diff = diffData.diff;
  const statistics = diffData.diff.statistics;
  const summary = diffData.diff.summary;
  

  if (!diff || !statistics || !summary) {
    console.error('Missing properties:', {
      diff: !!diff,
      statistics: !!statistics,
      summary: !!summary,
      diffDataDiff: diffData.diff
    });
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Invalid diff data</AlertTitle>
        <AlertDescription>Diff data is missing required properties.</AlertDescription>
      </Alert>
    );
  }

  if (!diff.line_diff || !diff.word_diff || !diff.char_diff) {
    console.error('Missing diff arrays:', {
      line_diff: diff.line_diff,
      word_diff: diff.word_diff,
      char_diff: diff.char_diff
    });
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Invalid diff format</AlertTitle>
        <AlertDescription>Diff data is missing required arrays.</AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Summary Statistics */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="blue.600">
            Changes Summary
          </Heading>
        </CardHeader>
        <CardBody>
          <HStack spacing={6} wrap="wrap">
            <Stat>
              <StatLabel>Change Type</StatLabel>
              <StatNumber>
                <Badge 
                  colorScheme={summary.change_type === 'major' ? 'red' : summary.change_type === 'minor' ? 'yellow' : 'green'}
                  size="lg"
                >
                  {summary.change_type.toUpperCase()}
                </Badge>
              </StatNumber>
              <StatHelpText>
                {summary.net_change > 0 ? '+' : ''}{summary.net_change} lines net change
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Lines</StatLabel>
              <StatNumber color="green.500">
                <StatArrow type="increase" />
                +{statistics.added_lines}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                -{statistics.removed_lines} removed
              </StatHelpText>
            </Stat>
          </HStack>
        </CardBody>
      </Card>

      {/* Side-by-side Line Diff */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="blue.600">
            Line-by-Line Changes
          </Heading>
        </CardHeader>
        <CardBody>
          <Box
            maxH="500px"
            overflowY="auto"
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack align="start" spacing={0}>
              {/* Previous Version */}
              <Box flex={1} p={4} bg="red.50" borderRight="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" fontWeight="bold" color="red.600" mb={2}>
                  Previous Version
                </Text>
                <Box fontFamily="mono" fontSize="sm">
                  {diffData.previous_content?.split('\n').map((line, index) => (
                    <Text key={index} color="red.700" bg={line.trim() ? "red.100" : "transparent"} p={1} borderRadius="sm">
                      {line || '\u00A0'}
                    </Text>
                  ))}
                </Box>
              </Box>
              
              {/* Current Version */}
              <Box flex={1} p={4} bg="green.50">
                <Text fontSize="sm" fontWeight="bold" color="green.600" mb={2}>
                  Current Version
                </Text>
                <Box fontFamily="mono" fontSize="sm">
                  {diffData.current_content?.split('\n').map((line, index) => (
                    <Text key={index} color="green.700" bg={line.trim() ? "green.100" : "transparent"} p={1} borderRadius="sm">
                      {line || '\u00A0'}
                    </Text>
                  ))}
                </Box>
              </Box>
            </HStack>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default RevisionDiff;
