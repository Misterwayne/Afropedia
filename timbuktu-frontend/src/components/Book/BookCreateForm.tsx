// components/Book/BookCreateForm.tsx
import React, { useEffect } from 'react'; // Import useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, Stack, FormErrorMessage, Text, Image,
  HStack
} from '@chakra-ui/react';
import ErrorMessage from '@/components/UI/ErrorMessage';

// Form data structure remains the same
export interface BookFormData {
  title: string;
  author: string;
  publication_date?: string | null; // Expecting "YYYY-MM-DD" string from input type="date"
  description?: string | null;
  cover_image?: string | null;
  isbn?: string | null;
}

interface BookCreateFormProps {
  onSubmit: SubmitHandler<BookFormData>;
  isLoading: boolean;
  apiError: string | null;
  isEditMode?: boolean; // <<< NEW: Flag for edit mode
  defaultValues?: Partial<BookFormData>; // <<< NEW: Default values for editing
}

// Helper to format Date object or ISO string to YYYY-MM-DD for date input
const formatDateForInput = (date?: string | Date | null): string => {
    if (!date) return '';
    try {
        // Attempt to parse the date string or use the Date object
        const d = new Date(date);
        // Check if the date is valid after parsing
        if (isNaN(d.getTime())) {
            return ''; // Return empty string if date is invalid
        }
        // Format to YYYY-MM-DD
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return ''; // Return empty on error
    }
};


const BookCreateForm: React.FC<BookCreateFormProps> = ({
  onSubmit,
  isLoading,
  apiError,
  isEditMode = false, // Default to false (create mode)
  defaultValues = {}, // Default to empty object
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Get reset function to set default values
  } = useForm<BookFormData>({ defaultValues }); // Pass defaultValues here initially

  // --- NEW: Effect to update form when defaultValues change (for edit mode) ---
  useEffect(() => {
     console.log("Default values received for form:", defaultValues);
     // Format date before resetting
     const formattedDefaults = {
        ...defaultValues,
        publication_date: formatDateForInput(defaultValues.publication_date)
     };
     console.log("Formatted default values:", formattedDefaults);
     reset(formattedDefaults); // Reset the form with new default values
  }, [defaultValues, reset]); // Depend on defaultValues and reset

  // Handle submission - process data before calling parent onSubmit
  const handleFormSubmit: SubmitHandler<BookFormData> = async (data) => {
     const processedData: Partial<BookFormData> = { // Use Partial for edit mode where not all fields might exist
        ...data,
        // Convert empty strings back to null for optional fields
        publication_date: data.publication_date || null,
        description: data.description || null,
        cover_image: data.cover_image || null,
        isbn: data.isbn || null,
     };
     // In edit mode, we might only want to send changed fields, but PATCH handles this.
     // For simplicity, send all fields processed. The backend BookUpdate schema handles optionality.
     await onSubmit(processedData as BookFormData); // Cast back for onSubmit type
  };

  return (
    <Box w="100%" maxW="700px">
      <ErrorMessage title={isEditMode ? "Update Error" : "Submission Error"} message={apiError} />
      <HStack mb={4} justifyContent="space-between" w={"80vw"}>
        <Box w={"100%"} flexGrow={1} p={4} borderWidth={1} borderRadius="md" boxShadow="md">

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack spacing={4}>
          {/* Title: Required for Create, ReadOnly/Hidden for Edit? Usually editable. */}
          <FormControl isInvalid={!!errors.title} isRequired={!isEditMode} >
            <FormLabel>Title</FormLabel>
            <Input
              // Make title read-only in edit mode if desired, or allow editing
              // isReadOnly={isEditMode}
              {...register('title', { required: 'Book title is required' })}
              placeholder="e.g., Dune"
              />
            <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
          </FormControl>

          {/* Author */}
          <FormControl isInvalid={!!errors.author} isRequired={!isEditMode}>
            <FormLabel>Author</FormLabel>
            <Input
              {...register('author', { required: 'Author name is required' })}
              placeholder="e.g., Frank Herbert"
            />
            <FormErrorMessage>{errors.author?.message}</FormErrorMessage>
          </FormControl>

          {/* Publication Date */}
          <FormControl isInvalid={!!errors.publication_date}>
            <FormLabel>Publication Date (Optional)</FormLabel>
            <Input
              type="date" // Renders browser date picker
              {...register('publication_date')}
            />
            <FormErrorMessage>{errors.publication_date?.message}</FormErrorMessage>
          </FormControl>

          {/* ISBN */}
           <FormControl isInvalid={!!errors.isbn}>
            <FormLabel>ISBN (Optional)</FormLabel>
            <Input
              {...register('isbn')}
              placeholder="e.g., 978-0441172719"
              />
             <FormErrorMessage>{errors.isbn?.message}</FormErrorMessage>
          </FormControl>

          {/* Cover Image URL */}
           <FormControl isInvalid={!!errors.cover_image}>
            <FormLabel>Cover Image URL (Optional)</FormLabel>
            <Input
              type="url"
              {...register('cover_image')}
              placeholder="https://example.com/cover.jpg"
              />
             <FormErrorMessage>{errors.cover_image?.message}</FormErrorMessage>
             <Text fontSize="xs" color="gray.500">URL of the book cover image.</Text>
          </FormControl>

          {/* Description */}
          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description (Optional)</FormLabel>
            <Textarea
              {...register('description')}
              placeholder="A brief summary or description of the book..."
              rows={6}
              />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          {/* Submit Button Text Changes */}
          <Button
            mt={4}
            colorScheme="teal"
            isLoading={isLoading}
            type="submit"
            alignSelf="flex-start"
            >
            {isEditMode ? 'Update Book' : 'Add Book to Library'}
          </Button>
        </Stack>
      </form>
      </Box>
      <Image
        src={defaultValues.cover_image || 'https://via.placeholder.com/150x200?text=No+Cover'} // Placeholder
        alt={`${defaultValues.title} cover`}
        height="60vh" // Fixed height for consistency
        width="100%"
        objectFit="contain" // Use contain to see whole cover, or cover to fill
        mb={4}
        borderRadius="md"
        />
    </HStack>
    </Box>
  );
};

export default BookCreateForm;
