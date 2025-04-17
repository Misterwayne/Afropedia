// pages/edit/[title].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRequireAuth } from '@/hooks/useRequireAuth'; // Adjust path
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { Heading, Box, useToast, Text, Flex } from '@chakra-ui/react';
import ArticleEditor, { ArticleFormData } from '@/components/Article/ArticleEditor'; // Adjust path
import apiClient from '@/lib/api'; // Adjust path
import Spinner from '@/components/UI/Spinner'; // Adjust path
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path
import { Article } from '@/types'; // Adjust path
import { SubmitHandler } from 'react-hook-form'; // Import SubmitHandler type

const EditArticlePage = () => {
    const { isAuthenticated, isAuthCheckComplete } = useRequireAuth();
    const router = useRouter();
    const { title } = router.query;
    const toast = useToast();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoadingArticle, setIsLoadingArticle] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // ... (useEffect for fetching article remains the same)
     useEffect(() => {
        if (title && typeof title === 'string') {
           setIsLoadingArticle(true);
           setFetchError(null);
           setArticle(null);
           apiClient.get<Article>(`/articles/${title}`)
              .then(response => {
                 if (response.data && response.data.currentRevision) {
                    setArticle(response.data);
                 } else {
                    setFetchError(`Could not load current revision for article "${title}".`);
                 }
              })
              .catch(error => {
                 console.error("Failed to fetch article for editing:", error);
                 setFetchError(error.response?.data?.message || `Article "${title}" not found or could not be loaded.`);
              })
              .finally(() => setIsLoadingArticle(false));
        } else if (router.isReady) {
           setIsLoadingArticle(false);
           setFetchError("Article title not found in URL.");
        }
     }, [title, router.isReady]);


    const handleUpdateArticle: SubmitHandler<ArticleFormData> = async (data) => {
        if (!title || typeof title !== 'string') {
            setSubmitError("Cannot save changes: Article title is missing.");
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        try {
        const response = await apiClient.patch<Article>(`/articles/${title}`, {
            content: data.content,
            comment: data.comment || null,
        });
        // See note in NewArticlePage about resetting form state. Redirecting is usually sufficient.
        toast({
            title: 'Article Updated!', status: 'success', duration: 3000, isClosable: true, position: 'top',
        });
        router.push(`/wiki/${response.data.title}`); // Redirect BEFORE state might get cleared
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to save changes.';
            setSubmitError(errorMessage);
            toast({ // Show error toast
               title: 'Update Failed', description: errorMessage, status: 'error', duration: 5000, isClosable: true, position: 'top',
            });
            console.error('Article update failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (!isAuthCheckComplete || isLoadingArticle) {
       return <Flex justify="center" align="center" minH="50vh"><Spinner size="xl" /></Flex>;
    }
    if (!isAuthenticated) {
       return <Text>Redirecting to login...</Text>;
    }
    if (fetchError || !article || !article.currentRevision) {
       return (
           <Box>
               <Heading as="h1" size="xl" mb={6}>Edit Article</Heading>
               <ErrorMessage title="Load Error" message={fetchError || `Could not load data for article "${title}".`} />
           </Box>
       );
    }

    // Prepare default values for the editor
    const editorDefaultValues = {
       content: article.currentRevision.content,
       comment: '', // Don't prefill comment usually
    };

    return (
        <Box>
        <Heading as="h1" size="xl" mb={6}>
            Editing: {article.title.replace(/_/g, ' ')}
        </Heading>
        <ArticleEditor
            onSubmit={handleUpdateArticle}
            isSubmitting={isSubmitting}
            apiError={submitError}
            defaultValues={editorDefaultValues} // Pass fetched content
            isCreateMode={false}
        />
        </Box>
    );
};

export default EditArticlePage;