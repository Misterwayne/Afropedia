// components/Article/MediaUploadModal.tsx
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, useToast, Box, Text
} from '@chakra-ui/react';
import MusicUploadForm from '@/components/Media/MusicUploadForm'; // Adjust path
import VideoUploadForm from '@/components/Media/VideoUploadForm'; // Adjust path
import apiClient from '@/lib/api'; // Adjust path
import { AxiosRequestConfig } from 'axios';
import ImageUploadForm from '../Image/ImageUploadForm';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'audio' | 'video' | 'image' | null; // Determines which form to show
  // Callback when upload is complete and tag should be inserted
  onUploadComplete: (type: 'Audio' | 'Video' | 'Image', id: number) => void;
}

interface ImageUploadApiResp {
    id: number;
    filename: string | null;
    public_url: string;
    message?: string;
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  mediaType,
  onUploadComplete
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const toast = useToast();

  // This function is passed down to the specific upload forms
  const handleUploadSubmit = async (formData: FormData) => {
    if (!mediaType) {
        toast({ title: "Error", description: "Media type not specified.", status: "error" });
        return;
    };

    setIsSubmitting(true);
    setApiError(null);
    setUploadProgress(0);
    let endpoint: string;
    let typeName: 'Audio' | 'Video' | 'Image';

    if (mediaType === 'audio') {
        endpoint = '/music/upload';
        typeName = 'Audio';
    } else if (mediaType === 'video') {
        endpoint = '/videos/upload';
        typeName = 'Video';
    } else if (mediaType === 'image') {
        endpoint = '/images/upload';
        typeName = 'Image';
    } else {
        setApiError("Invalid media type selected.");
        setIsSubmitting(false);
        return;
    }

    const config: AxiosRequestConfig = {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
         },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
           ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
           : 0;
           setUploadProgress(percentCompleted);
        },
    };

    try {
       const response = await apiClient.post(endpoint, formData, config);
       const id = response.data.id; // Assuming response structure provides 'id'
       const publicUrl = response.data.public_url;
       
       // Validate that we got a valid ID
       if (typeof id !== 'number') {
           console.error("API Response Data:", response.data); // Log response for debugging
           throw new Error(`API response did not include a valid numeric ID for the uploaded ${mediaType}.`);
       }

       // Show success toast
       toast({
         title: `${typeName} Upload Successful`,
         description: `ID: ${id}. Tag [[${typeName}:${id}]] ready to insert.`,
         status: 'success',
         duration: 4000,
         isClosable: true,
         position: 'top',
       });

       // Call the completion callback to insert the tag in the editor (ONLY ONCE)
       onUploadComplete(typeName, id);
       setUploadProgress(null);
       onClose(); // Close modal on success

    } catch (error: any) {
       const errorMessage = error.response?.data?.detail || error.message || `Failed to upload ${mediaType}.`;
       setApiError(errorMessage); // Set error to display in the form
       // Toast is still useful for general feedback
       toast({
         title: 'Upload Failed',
         description: errorMessage,
         status: 'error',
         duration: 7000,
         isClosable: true,
         position: 'top',
       });
       console.error(`${mediaType} upload failed:`, error);
       setUploadProgress(null); // Clear progress on error
       // Keep modal open on error so user can see the form error
    } finally {
       setIsSubmitting(false);
    }
  };

  // Clear error when modal is closed/reopened
  React.useEffect(() => {
      if (!isOpen) {
          setTimeout(() => { // Delay clearing slightly to avoid flash
            setApiError(null);
            setUploadProgress(null);
          }, 300);
      }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload {mediaType === 'audio' ? 'Audio' : 'Video'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {/* Conditionally render the correct form based on mediaType */}
          {mediaType === 'audio' && (
            <MusicUploadForm
              onSubmit={handleUploadSubmit} // Pass the modal's submit handler
              isSubmitting={isSubmitting}
              apiError={apiError}
              uploadProgress={uploadProgress}
            />
          )}
          {mediaType === 'video' && (
            <VideoUploadForm
               onSubmit={handleUploadSubmit} // Pass the modal's submit handler
               isSubmitting={isSubmitting}
               apiError={apiError}
               uploadProgress={uploadProgress}
            />
          )}
          {mediaType === 'image' && ( 
            <ImageUploadForm
                onSubmit={handleUploadSubmit as any}
                isSubmitting={isSubmitting}
                apiError={apiError}
                uploadProgress={uploadProgress}
            />
            )}
           {!mediaType && <Text>Error: No media type specified for modal.</Text>}
        </ModalBody>
        {/* Modal footer can be removed if forms contain submit buttons */}
        {/* <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default MediaUploadModal;