// components/Article/ArticleEditor.tsx
import React, { useState, useRef, useEffect, RefObject } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, Stack, FormErrorMessage,
  Grid, GridItem, Tabs, TabList, Tab, TabPanels, TabPanel, Text, Flex, Icon, useToast, useDisclosure
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import ErrorMessage from '@/components/UI/ErrorMessage';
import MarkdownToolbar from './MarkdownToolbar';
import ArticleViewer, { ExtractedHeading } from './ArticleViewer';
import MediaUploadModal from './MediaUploadModal'; // Import the modal
import { useRouter } from 'next/router';

// Form data structure for the main article edit/create form
export interface ArticleFormData {
  title?: string; // Optional: only for create mode
  content: string;
  comment: string;
}

interface ArticleEditorProps {
  onSubmit: SubmitHandler<ArticleFormData>; // Handles saving the article itself
  defaultValues?: Partial<ArticleFormData>;
  isSubmitting: boolean; // For the main article save button
  apiError: string | null; // Error from the main article save attempt
  isCreateMode?: boolean;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  onSubmit,
  defaultValues = { title: '', content: '', comment: '' },
  isSubmitting,
  apiError, // This is for the ARTICLE save, not media upload
  isCreateMode = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty: formIsDirty },
    reset,
    setValue, // Function to programmatically set form values
    getValues, // Function to get current form values
  } = useForm<ArticleFormData>({ defaultValues });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const watchedContent = watch('content', defaultValues.content); // Watch content for preview
  const toast = useToast();
  const router = useRouter();

  // State for the media upload modal
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [modalMediaType, setModalMediaType] = useState<'audio' | 'video' | 'image' | null>(null);

  // --- Unsaved Changes Warning Effect ---
  useEffect(() => {
    const warningText = 'You have unsaved changes. Are you sure you want to leave?';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!formIsDirty) return;
      e.preventDefault();
      e.returnValue = warningText;
    };
    const handleRouteChange = (url: string) => {
       const currentBasePath = router.asPath.split('?')[0];
       const targetBasePath = url.split('?')[0];
       if (formIsDirty && currentBasePath !== targetBasePath && !window.confirm(warningText)) { // Use window.confirm
         router.events.emit('routeChangeError');
         throw 'routeChange aborted by user.'; // Abort route change
       }
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => { // Cleanup
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [formIsDirty, router]); // Re-run if dirty status changes

  // --- Reset form when default values change (e.g., on edit page load) ---
   useEffect(() => {
     // Only reset if defaultValues actually change reference or content
     // (Prevents unnecessary resets)
     reset(defaultValues);
   }, [defaultValues, reset]);

   // --- Modal Control Functions ---
   const handleOpenAudioModal = () => {
       setModalMediaType('audio');
       onModalOpen();
   };
   const handleOpenVideoModal = () => {
       setModalMediaType('video');
       onModalOpen();
   };
   const handleOpenImageModal = () => { 
    setModalMediaType('image'); 
    onModalOpen(); 
   };

   // --- Callback for Modal: Insert Media Tag ---
   const handleMediaInsert = (type: 'Audio' | 'Video' | 'Image', id: number | string) => {
      const textarea = textareaRef.current;
      const currentContent = getValues('content') || ''; // Get current content safely
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tag = `[[${type}:${id}]]`;
      const before = currentContent.substring(0, start);
      const selectedText = currentContent.substring(start, end); // Keep selected text if any
      const after = currentContent.substring(end);

      // Insert the tag, replacing selected text or inserting at cursor
      const newContent = `${before}${tag}${after}`;

      // Update form state & mark as dirty
      setValue('content', newContent, { shouldDirty: true });

      // Refocus and position cursor
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
   };


  return (
    <Box w="100%">
      {/* Error message for the main ARTICLE save operation */}
      <ErrorMessage title="Save Error" message={apiError} />

      {/* Main Article Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Title Input (Create Mode Only) */}
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

          {/* Toolbar and Editor Area using Controller for content */}
          <Controller
             name="content"
             control={control}
             rules={{ required: 'Content cannot be empty' }}
             render={({ field }) => ( // field contains { onChange, onBlur, value, name, ref }
                <>
                   {/* Pass modal openers down to the toolbar */}
                   <MarkdownToolbar
                      textareaRef={textareaRef as RefObject<HTMLTextAreaElement>} // Assign ref for toolbar interaction
                      onContentChange={(value) => field.onChange(value)} // Update form state on toolbar action
                      onOpenAudioModal={handleOpenAudioModal}
                      onOpenVideoModal={handleOpenVideoModal}
                      onOpenImageModal={handleOpenImageModal}
                   />

                   {/* Responsive Editor/Preview Layout */}
                   {/* Tabs for smaller screens */}
                   <Tabs variant="enclosed-colored" display={{ base: 'block', lg: 'none' }} size="sm">
                      <TabList>
                         <Tab>Edit</Tab>
                         <Tab>Preview</Tab>
                      </TabList>
                      <TabPanels>
                         <TabPanel p={0}>
                            <Textarea
                               {...field} // Spread field props from Controller
                               ref={textareaRef} // Assign ref for toolbar interaction
                               placeholder="# Start writing your article..."
                               rows={20}
                               fontFamily="monospace"
                               isInvalid={!!errors.content}
                               size="sm"
                            />
                         </TabPanel>
                         <TabPanel borderWidth="1px" borderRadius="md">
                              {/* Use watched value for preview */}
                              <ArticleViewer content={watchedContent || ''} />
                         </TabPanel>
                      </TabPanels>
                   </Tabs>

                  {/* Side-by-side Grid for larger screens */}
                   <Grid
                       templateColumns={{ lg: '1fr 1fr' }} // 50/50 split on large+ screens
                       gap={4}
                       display={{ base: 'none', lg: 'grid' }} // Hide Grid on smaller screens
                   >
                      {/* Textarea Editor */}
                      <GridItem>
                         <FormLabel htmlFor='content' srOnly>Content (Markdown)</FormLabel>
                          <Textarea
                            {...field} // Spread field props
                            ref={textareaRef} // Assign ref
                            id="content"
                            placeholder="# Start writing your article..."
                            rows={30} // Taller for side-by-side
                            fontFamily="monospace"
                            isInvalid={!!errors.content}
                            size="sm"
                         />
                      </GridItem>

                      {/* Live Preview */}
                      <GridItem borderWidth="1px" borderRadius="md" p={3} bg="white" overflowY="auto" maxH="70vh">
                         {/* Use watched value for live preview */}
                         <ArticleViewer content={watchedContent || ''} />
                      </GridItem>
                   </Grid>

                   {/* Display validation error for content */}
                   <FormErrorMessage mt={errors.content ? 1 : -2}>{errors.content?.message}</FormErrorMessage>
                </>
             )}
          />

          {/* Edit Summary Input */}
          <FormControl id="comment">
            <FormLabel>Edit Summary (Optional)</FormLabel>
            <Input
              {...register('comment')}
              placeholder="Briefly describe your changes"
            />
          </FormControl>

          {/* Save Button and Dirty Indicator */}
          <Flex align="center" justify="space-between" mt={2}>
              <Button
                colorScheme="teal"
                isLoading={isSubmitting} // Loading state for ARTICLE save
                type="submit"
                leftIcon={formIsDirty ? <Icon as={WarningIcon} color="orange.400" /> : undefined}
              >
                 {isCreateMode ? 'Publish Article' : 'Save Changes'}
                 {formIsDirty && <Text as="span" ml={1} display={{base: 'none', sm: 'inline'}}>*</Text>}
              </Button>
             {formIsDirty && <Text fontSize="sm" color="orange.500" ml={4}>Unsaved changes</Text>}
          </Flex>
        </Stack>
      </form>

      {/* The Media Upload Modal component */}
      <MediaUploadModal
         isOpen={isModalOpen}
         onClose={onModalClose}
         mediaType={modalMediaType}
         onUploadComplete={handleMediaInsert} // Pass the insertion function
      />
    </Box>
  );
};

export default ArticleEditor;