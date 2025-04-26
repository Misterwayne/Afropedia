// components/Music/MusicUploadForm.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box, Button, FormControl, FormLabel, Input, Stack, FormErrorMessage, Progress, Text, Image, Center
} from '@chakra-ui/react';
// Note: ErrorMessage component might be removed if modal handles global errors,
// but keeping it within the form can provide more specific feedback.
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path if needed

// Data structure for the form itself
interface MusicFormData {
  title: string;
  artist: string;
  album: string;
  file: FileList; // From <input type="file">
  cover?: FileList; // Optional cover
}

// Props expected by this form component
interface MusicUploadFormProps {
  onSubmit: (data: FormData) => Promise<void>; // Expects parent to handle FormData submission
  isSubmitting: boolean; // Passed from parent modal/page
  apiError: string | null; // Passed from parent modal/page
  uploadProgress: number | null; // Passed from parent modal/page
}

const MusicUploadForm: React.FC<MusicUploadFormProps> = ({
  onSubmit,
  isSubmitting,
  apiError, // Display API errors passed from the modal
  uploadProgress,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<MusicFormData>();

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const watchedCover = watch('cover');

  // Generate cover preview
  React.useEffect(() => {
    if (watchedCover && watchedCover.length > 0) {
      const file = watchedCover[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  }, [watchedCover]);

  // This handler converts form data to FormData and calls the parent's onSubmit
  const handleFormSubmit: SubmitHandler<MusicFormData> = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('artist', data.artist);
    formData.append('album', data.album);
    if (data.file && data.file.length > 0) {
       formData.append('file', data.file[0]);
    } else {
        // Handle error: file is required
        console.error("Music file is missing.");
        // Potentially set a local form error state if not relying solely on validation
        return;
    }
    if (data.cover && data.cover.length > 0) {
        formData.append('cover', data.cover[0]);
    }

    await onSubmit(formData); // Call the onSubmit passed from the modal

    // Optionally reset form (the modal might handle closing/resetting state)
    // reset();
    // setCoverPreview(null);
  };

  return (
    // Removed outer Box constraint, modal controls size
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={4}>
         {/* Display API errors from the modal submit process */}
         <ErrorMessage title="Upload Error" message={apiError} />

        <FormControl isInvalid={!!errors.title} isRequired>
          <FormLabel fontSize="sm">Title</FormLabel>
          <Input size="sm" {...register('title', { required: 'Title is required' })} />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.artist} isRequired>
          <FormLabel fontSize="sm">Artist</FormLabel>
          <Input size="sm" {...register('artist', { required: 'Artist is required' })} />
          <FormErrorMessage>{errors.artist?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.album} isRequired>
          <FormLabel fontSize="sm">Album</FormLabel>
          <Input size="sm" {...register('album', { required: 'Album is required' })} />
          <FormErrorMessage>{errors.album?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.file} isRequired>
          <FormLabel fontSize="sm">Audio File</FormLabel>
          <Input
             type="file"
             accept="audio/*"
             border="none"
             p={1.5}
             size="sm"
             {...register('file', { required: 'Audio file is required' })}
          />
          <FormErrorMessage>{errors.file?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.cover}>
          <FormLabel fontSize="sm">Cover Art (Optional)</FormLabel>
          <Input
             type="file"
             accept="image/*"
             border="none"
             p={1.5}
             size="sm"
             {...register('cover')}
          />
          {coverPreview && (
             <Center mt={3}>
                <Image src={coverPreview} alt="Cover preview" maxH="100px" borderRadius="md" />
             </Center>
          )}
          <FormErrorMessage>{errors.cover?.message}</FormErrorMessage>
        </FormControl>

        {/* Progress bar */}
        {uploadProgress !== null && (
           <Box pt={2}>
                <Progress hasStripe isAnimated value={uploadProgress} size="sm" colorScheme="teal" />
                <Text textAlign="center" fontSize="xs" mt={1}>{uploadProgress}%</Text>
           </Box>
        )}

        {/* Submit button specific to this form */}
        <Button
          mt={2}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
          size="md"
          width="full" // Make button full width within modal body
        >
          Upload Music
        </Button>
      </Stack>
    </form>
  );
};

export default MusicUploadForm;