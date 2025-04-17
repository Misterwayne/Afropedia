// pages/history/[title].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Heading, Box, Text, Flex } from '@chakra-ui/react';
import apiClient from '@/lib/api'; // Adjust path
import Spinner from '@/components/UI/Spinner'; // Adjust path
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path
import RevisionList from '@/components/Article/RevisionList'; // Adjust path
import { Revision } from '@/types'; // Adjust path

const HistoryPage = () => {
  const router = useRouter();
  const { title } = router.query; // Get the normalized title from URL

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (title && typeof title === 'string') {
      setIsLoading(true);
      setError(null);
      setRevisions([]); // Clear previous results

      apiClient.get<Revision[]>(`/articles/${title}/revisions`)
        .then(response => {
          setRevisions(response.data);
        })
        .catch(err => {
          console.error("Failed to fetch revisions:", err);
          setError(err.response?.data?.message || `Could not load history for article "${title}".`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if(router.isReady) {
        setIsLoading(false);
        setError("Article title not found in URL.");
    }
  }, [title, router.isReady]); // Rerun if title changes

  // --- Render Logic ---
  if (isLoading) {
     return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={2}>
        Revision History: {title ? (title as string).replace(/_/g, ' ') : 'Loading...'}
      </Heading>
       {error && <ErrorMessage title="Load Error" message={error} />}
      {!error && title && typeof title === 'string' && (
        <RevisionList revisions={revisions} articleTitle={title} />
      )}
    </Box>
  );
};

export default HistoryPage;