// components/Video/VideoUploadForm.tsx
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box, Button, FormControl, FormLabel, Input, Stack, FormErrorMessage, Progress, Text
} from '@chakra-ui/react';
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path

interface VideoFormData {
  file: FileList;
}

interface VideoUploadFormProps {
  onSubmit: (data: FormData) => Promise<void>; // Expect FormData
  isSubmitting: boolean;
  apiError: string | null;
  uploadProgress: number | null;
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({
  onSubmit,
  isSubmitting,
  apiError,
  uploadProgress,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VideoFormData>();

  const handleFormSubmit: SubmitHandler<VideoFormData> = async (data) => {
    if (!data.file || data.file.length === 0) {
       console.error("Video file is missing.");
       return;
    }
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('body', "x");
    console.log(data.file[0]);
    await onSubmit(formData); // Call parent (modal) onSubmit
    // reset(); // Modal usually handles closing/resetting state
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={4}>
        <ErrorMessage title="Upload Error" message={apiError} />

        <FormControl isInvalid={!!errors.file} isRequired>
          <FormLabel fontSize="sm">Video File</FormLabel>
          <Input
            type="file"
            accept="video/*"
            border="none"
            p={1.5}
            size="sm"
            {...register('file', { required: 'Video file is required' })}
          />
          <FormErrorMessage>{errors.file?.message}</FormErrorMessage>
        </FormControl>

        {uploadProgress !== null && (
            <Box pt={2}>
                 <Progress hasStripe isAnimated value={uploadProgress} size="sm" colorScheme="teal" />
                 <Text textAlign="center" fontSize="xs" mt={1}>{uploadProgress}%</Text>
            </Box>
        )}

        <Button
          mt={2}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
          size="md"
          width="full" // Full width button
        >
          Upload Video
        </Button>
      </Stack>
    </form>
  );
};

export default VideoUploadForm;