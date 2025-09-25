import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import axios from 'axios';

interface ContentFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: string;
  contentId: number;
  onFlagSubmitted?: () => void;
}

const ContentFlagModal: React.FC<ContentFlagModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  onFlagSubmitted
}) => {
  const [flagType, setFlagType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const flagTypes = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam' },
    { value: 'inaccurate', label: 'Inaccurate Information' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!flagType || !reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a flag type and provide a reason",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post('http://localhost:8000/moderation/flag', {
        content_type: contentType,
        content_id: contentId,
        flag_type: flagType,
        reason: reason.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Content Flagged",
        description: "Your flag has been submitted for review",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFlagType('');
      setReason('');
      
      // Notify parent component
      if (onFlagSubmitted) {
        onFlagSubmitted();
      }
      
      onClose();
    } catch (error) {
      console.error('Error flagging content:', error);
      toast({
        title: "Error",
        description: "Failed to flag content. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFlagType('');
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Flag Content</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>Flagging Content</AlertTitle>
              <AlertDescription>
                Help us maintain quality by reporting content that violates our guidelines.
              </AlertDescription>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Flag Type</FormLabel>
              <Select
                placeholder="Select a reason for flagging"
                value={flagType}
                onChange={(e) => setFlagType(e.target.value)}
              >
                {flagTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                placeholder="Please provide specific details about why this content should be flagged..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                resize="vertical"
              />
            </FormControl>

            <Alert status="warning" size="sm">
              <AlertIcon />
              <AlertDescription>
                False or malicious flagging may result in account restrictions.
              </AlertDescription>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting..."
          >
            Flag Content
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContentFlagModal;
