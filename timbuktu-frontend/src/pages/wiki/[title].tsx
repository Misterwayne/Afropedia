// pages/wiki/[title].tsx
import { useState, useEffect } from 'react'; // Import useState
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Heading, Box, Text, Flex, Link as ChakraLink, Button, Grid, GridItem } from '@chakra-ui/react'; // Import Grid, GridItem
import apiClient from '@/lib/api';
import Spinner from '@/components/UI/Spinner';
import ErrorMessage from '@/components/UI/ErrorMessage';
import ArticleViewer, { ExtractedHeading } from '@/components/Article/ArticleViewer'; // Import ExtractedHeading type
import TableOfContents from '@/components/Article/TableOfContent'; // Import ToC component
import { Article } from '@/types';
import Link from 'next/link';
import { EditIcon, TimeIcon } from '@chakra-ui/icons';

// getServerSideProps remains the same as before...
export const getServerSideProps: GetServerSideProps<{ article: Article | null; error?: string | null }> = async (context) => {
    const { title } = context.params ?? {};
    let article: Article | null = null;
    let error: string | null = null;

    if (typeof title !== 'string') {
       return { notFound: true };
    }
    try {
       const response = await apiClient.get<Article>(`/articles/${title}`);
       article = response.data;
       if (!article?.currentRevision) {
          console.warn(`Article found but currentRevision missing for title: ${title}`);
          return { notFound: true };
       }
    } catch (err: any) {
       console.error(`GSSP Error fetching article ${title}:`, err.response?.status, err.response?.data);
       if (err.response?.status === 404) {
          return { notFound: true };
       }
       error = err.response?.data?.message || `Failed to load article "${title}".`;
    }
    return { props: { article, error } };
};


const WikiPage = ({ article, error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const titleFromRouter = router.query.title as string | undefined;

  // State to hold the headings extracted from ArticleViewer
  const [headings, setHeadings] = useState<ExtractedHeading[]>([]);

  // Callback function to receive headings from ArticleViewer
  const handleHeadingsExtracted = (extractedHeadings: ExtractedHeading[]) => {
     // Update state only if the headings have actually changed to avoid infinite loops
     // Simple JSON comparison works here for basic cases
     if (JSON.stringify(extractedHeadings) !== JSON.stringify(headings)) {
        setHeadings(extractedHeadings);
     }
  };

  // --- Render Logic ---
  if (error) {
     return (
         <Box>
             <Heading as="h1" size="xl" mb={6}>{titleFromRouter?.replace(/_/g, ' ') ?? 'Error'}</Heading>
             <ErrorMessage title="Load Error" message={error} />
         </Box>
     );
  }
  if (!article || !article.currentRevision) {
     return <ErrorMessage title="Load Error" message={`Could not display article data for "${titleFromRouter}".`} />
  }

  const displayTitle = article.title.replace(/_/g, ' ');
  const hasHeadings = headings.length > 0; // Check if there are headings to display ToC

  return (
    <Box>
      {/* --- Top Meta Section (Title, Edit/History Buttons) --- */}
      <Flex justify="space-between" align="center" wrap="wrap" mb={4}>
          <Heading as="h1" size="2xl" mb={{ base: 2, md: 0 }}>
             {displayTitle}
          </Heading>
          <Flex>
              <Link href={`/edit/${article.title}`} passHref>
                 <Button leftIcon={<EditIcon />} size="sm" variant="outline" colorScheme="teal" mr={2}>Edit</Button>
              </Link>
              <Link href={`/history/${article.title}`} passHref>
                 <Button leftIcon={<TimeIcon />} size="sm" variant="outline" colorScheme="gray">History</Button>
              </Link>
          </Flex>
      </Flex>
      <Text fontSize="sm" color="gray.500" mb={6}> {/* Increased bottom margin */}
         Last updated on {new Date(article.currentRevision.timestamp).toLocaleString()}
         {article.currentRevision.user && ` by ${article.currentRevision.user.username}`}
         {article.currentRevision.comment && ` (${article.currentRevision.comment})`}
      </Text>

      {/* --- Main Content Area (Article + Optional ToC) --- */}
      {/* Use Grid for layout: Main content area and optional sidebar for ToC */}
      <Grid
         templateColumns={{ base: '1fr', md: hasHeadings ? '1fr 250px' : '1fr' }} // Only add ToC column if headings exist on medium screens up
         gap={10} // Gap between article and ToC
         alignItems="start" // Align items to the top
      >
         {/* Article Content */}
         <GridItem>
            <ArticleViewer
              content={article.currentRevision.content}
              onHeadingsExtracted={handleHeadingsExtracted} // Pass the callback
            />
         </GridItem>

         {/* Table of Contents (Only render if headings exist) */}
         {hasHeadings && (
             <GridItem display={{ base: 'none', md: 'block' }}> {/* Hide ToC on small screens */}
                <TableOfContents headings={headings} />
             </GridItem>
         )}
      </Grid>
    </Box>
  );
};

export default WikiPage;