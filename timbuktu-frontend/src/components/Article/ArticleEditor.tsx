// components/Article/ArticleEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, Stack, FormErrorMessage,
  Grid, GridItem, Tabs, TabList, Tab, TabPanels, TabPanel, Text, Flex, Icon, useToast
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import ErrorMessage from '@/components/UI/ErrorMessage';
import MarkdownToolbar from './MarkdownToolbar'; // Import Toolbar
import ArticleViewer from './ArticleViewer'; // Import Viewer for preview
import { useRouter } from 'next/router'; // Import router for navigation blocking

export interface ArticleFormData {
  title?: string;
  content: string;
  comment: string;
}

interface ArticleEditorProps {
  onSubmit: SubmitHandler<ArticleFormData>;
  defaultValues?: Partial<ArticleFormData>;
  isSubmitting: boolean;
  apiError: string | null;
  isCreateMode?: boolean;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  onSubmit,
  defaultValues = { title: '', content: '', comment: '' },
  isSubmitting,
  apiError,
  isCreateMode = false,
}) => {
  const {
    register,
    handleSubmit,
    control, // Need Controller for controlled Textarea update
    watch,
    formState: { errors, isDirty: formIsDirty }, // Get isDirty state from RHF
    reset, // Function to reset form state
  } = useForm<ArticleFormData>({ defaultValues });

  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the Textarea
  const watchedContent = watch('content', defaultValues.content); // Watch content changes for preview
  const toast = useToast();
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(true); // State to toggle preview

  // Effect to handle unsaved changes warning
  useEffect(() => {
    const warningText = 'You have unsaved changes. Are you sure you want to leave?';

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!formIsDirty) return;
      e.preventDefault();
      e.returnValue = warningText; // Standard way to show browser default prompt
    };

    const handleRouteChange = (url: string) => {
       // Compare base paths to avoid warning on successful save redirect
       const currentBasePath = router.asPath.split('?')[0];
       const targetBasePath = url.split('?')[0];
      if (formIsDirty && currentBasePath !== targetBasePath && !confirm(warningText)) {
        router.events.emit('routeChangeError');
         // Throw to prevent navigation
         // Note: This can sometimes be unreliable depending on browser/Next.js version
         // A more robust solution might involve global state management or dedicated libraries
        throw 'routeChange aborted.';
      }
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleRouteChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [formIsDirty, router]); // Depend on formIsDirty state

   // Reset form state when defaultValues change (e.g., loading existing article data)
   useEffect(() => {
     reset(defaultValues);
   }, [defaultValues, reset]);

  return (
    <Box w="100%">
      <ErrorMessage title="Submission Error" message={apiError} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {isCreateMode && (
            <FormControl id="title" isInvalid={!!errors.title} isRequired>
              <FormLabel>Article Title</FormLabel>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="My Awesome Article"
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>
          )}

          {/* Toolbar */}
          <Controller
             name="content"
             control={control}
             rules={{ required: 'Content cannot be empty' }}
             render={({ field }) => (
                <>
                   <MarkdownToolbar
                      textareaRef={textareaRef as any} // Typecast to any to avoid TS error
                      onContentChange={(value) => field.onChange(value)} // Update RHF state
                   />
                    {/* Editor & Preview Layout */}
                    {/* Using Tabs for smaller screens, Grid for larger */}
                    <Tabs variant="enclosed-colored" display={{ base: 'block', md: 'none' }}>
                       <TabList>
                          <Tab>Edit</Tab>
                          <Tab>Preview</Tab>
                       </TabList>
                       <TabPanels>
                          <TabPanel p={0}>
                             <Textarea
                                {...field} // Spread field props (onChange, onBlur, value, name, ref)
                                ref={textareaRef} // Assign ref here as well
                                placeholder="# Start writing your article..."
                                rows={20}
                                fontFamily="monospace"
                                isInvalid={!!errors.content}
                                size="sm" // Smaller font in editor
                             />
                          </TabPanel>
                          <TabPanel>
                               <ArticleViewer content={watchedContent || ''} onHeadingsExtracted={() => {}} />
                          </TabPanel>
                       </TabPanels>
                    </Tabs>

                   <Grid
                       templateColumns={{ md: '1fr 1fr' }} // 50/50 split on medium+ screens
                       gap={4}
                       display={{ base: 'none', md: 'grid' }} // Hide Grid on small screens
                   >
                      {/* Textarea Editor */}
                      <GridItem>
                         <FormLabel htmlFor='content' srOnly>Content (Markdown)</FormLabel> {/* Label linked for accessibility */}
                          <Textarea
                            {...field} // Spread field props
                            ref={textareaRef} // Assign ref
                            id="content" // Ensure ID matches label
                            placeholder="# Start writing your article..."
                            rows={25} // Adjust height
                            fontFamily="monospace"
                            isInvalid={!!errors.content}
                            size="sm"
                         />
                      </GridItem>

                      {/* Live Preview */}
                      <GridItem borderWidth="1px" borderRadius="md" p={3} bg="white" overflowY="auto" maxH="600px"> {/* Constrain height and scroll */}
                         <ArticleViewer content={watchedContent || ''} onHeadingsExtracted={() => {}} />
                      </GridItem>
                   </Grid>
                   <FormErrorMessage mt={-2}>{errors.content?.message}</FormErrorMessage>
                </>
             )}
          />


          <FormControl id="comment">
            <FormLabel>Edit Summary (Optional)</FormLabel>
            <Input
              {...register('comment')}
              placeholder="Briefly describe your changes"
            />
          </FormControl>

          {/* Save Button and Dirty Indicator */}
          <Flex align="center" justify="space-between">
              <Button
                mt={2} // Reduced margin
                colorScheme="teal"
                isLoading={isSubmitting}
                type="submit"
                leftIcon={formIsDirty ? <Icon as={WarningIcon} color="orange.400" /> : undefined} // Show warning icon if dirty
              >
                 {isCreateMode ? 'Publish Article' : 'Save Changes'}
                 {formIsDirty && <Text as="span" ml={1} display={{base: 'none', sm: 'inline'}}>*</Text>} {/* Unsaved indicator */}
              </Button>
             {formIsDirty && <Text fontSize="sm" color="orange.500" ml={4}>You have unsaved changes.</Text>}
          </Flex>
        </Stack>
      </form>
    </Box>
  );
};

export default ArticleEditor;