// components/Image/ImageUploadForm.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box, Button, FormControl, FormLabel, Input, Stack, FormErrorMessage, Progress, Text, Image, Center
} from '@chakra-ui/react';
import ErrorMessage from '@/components/UI/ErrorMessage'; // Adjust path

interface ImageFormData {
  file: FileList;
  // Optional: Add alt text input
  // altText?: string;
}

interface ImageUploadFormProps {
  onSubmit: (data: FormData) => Promise<{ public_url: string, filename: string | null }>; // Expect URL back
  isSubmitting: boolean;
  apiError: string | null;
  uploadProgress: number | null;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  onSubmit,
  isSubmitting,
  apiError,
  uploadProgress,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ImageFormData>();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const watchedFile = watch('file');

  // Generate image preview
  React.useEffect(() => {
    if (watchedFile && watchedFile.length > 0) {
      const file = watchedFile[0];
      if (file.type.startsWith('image/')) { // Ensure it's an image for preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      } else {
          setPreviewUrl(null); // Not an image file selected
      }
    } else {
      setPreviewUrl(null);
    }
  }, [watchedFile]);

  const handleFormSubmit: SubmitHandler<ImageFormData> = async (data) => {
    if (!data.file || data.file.length === 0) return;

    const formData = new FormData();
    formData.append('file', data.file[0]);
    // if (data.altText) { formData.append('altText', data.altText); } // If adding alt text field

    await onSubmit(formData); // Call parent onSubmit
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={4}>
        <ErrorMessage title="Upload Error" message={apiError} />

        <FormControl isInvalid={!!errors.file} isRequired>
          <FormLabel fontSize="sm">Image File</FormLabel>
          <Input
            type="file"
            accept="image/*" // Only accept images
            border="none"
            p={1.5}
            size="sm"
            {...register('file', { required: 'Image file is required' })}
          />
          <FormErrorMessage>{errors.file?.message}</FormErrorMessage>
        </FormControl>

        {/* Optional: Alt text input */}
        {/* <FormControl>
             <FormLabel fontSize="sm">Alt Text (Optional)</FormLabel>
             <Input size="sm" {...register('altText')} placeholder="Describe the image"/>
        </FormControl> */}


        {previewUrl && (
          <Center mt={3}>
            <Image src={previewUrl} alt="Image preview" maxH="150px" borderRadius="md" />
          </Center>
        )}

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
          width="full"
        >
          Upload Image
        </Button>
      </Stack>
    </form>
  );
};

export default ImageUploadForm;