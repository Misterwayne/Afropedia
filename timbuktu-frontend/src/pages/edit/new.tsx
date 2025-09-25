// pages/edit/new.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useRequireAuth } from '@/hooks/useRequireAuth'; // Adjust path
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { Heading, Box, useToast, Flex, Text, Container } from '@chakra-ui/react';
import ArticleEditor, { ArticleFormData } from '@/components/Article/ArticleEditor'; // Adjust path
import apiClient from '@/lib/api'; // Adjust path
import Spinner from '@/components/UI/Spinner'; // Adjust path
import { Article } from '@/types'; // Adjust path
import { SubmitHandler } from 'react-hook-form';


const NewArticlePage = () => {
    const { isAuthenticated, isAuthCheckComplete } = useRequireAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const router = useRouter();
    const toast = useToast();
  
    const handleCreateArticle: SubmitHandler<ArticleFormData> = async (data) => {
      setIsSubmitting(true);
      setApiError(null);
      try {
        if (!data.title) throw new Error("Title is missing."); // Should be caught by form validation too
  
        const response = await apiClient.post<Article>('/articles', {
           title: data.title,
           content: data.content,
           comment: data.comment || null,
        });
  
        // Reset form state via RHF *after* successful submission
        // NOTE: ArticleEditor needs to accept and use the reset function from useForm
        // (This part requires passing `reset` down or handling it differently)
        // For now, we rely on the redirect clearing the page state.
  
        toast({
          title: 'Article Published!', status: 'success', duration: 3000, isClosable: true, position: 'top',
        });
        router.push(`/wiki/${response.data.title}`); // Redirect BEFORE resetting might be better UX
      } catch (error: any) {
         const errorMessage = error.response?.data?.message || 'Failed to create article.';
         setApiError(errorMessage);
         toast({ // Show error toast
            title: 'Creation Failed', description: errorMessage, status: 'error', duration: 5000, isClosable: true, position: 'top',
         });
         console.error('Article creation failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    if (!isAuthCheckComplete) {
      return (
        <Container maxW="7xl" py={8}>
          <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>
        </Container>
      );
    }
    if (!isAuthenticated) {
       return (
        <Container maxW="7xl" py={8}>
          <Text>Redirecting to login...</Text>
        </Container>
       );
    }
  
    return (
      <Container maxW="7xl" py={8}>
        <Heading as="h1" size="xl" mb={6}>Create New Article</Heading>
        <ArticleEditor
          onSubmit={handleCreateArticle}
          isSubmitting={isSubmitting}
          apiError={apiError}
          isCreateMode={true}
          // Pass empty defaultValues explicitly for create mode
          defaultValues={{ title: '', content: '', comment: ''}}
          // No articleId or articleTitle for new articles
        />
      </Container>
    );
  };
  
  export default NewArticlePage;