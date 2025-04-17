// components/UI/ErrorMessage.tsx
import { Alert, AlertIcon, AlertTitle, AlertDescription, Box } from '@chakra-ui/react';

interface ErrorMessageProps {
  title?: string;
  message: string | undefined | null; // Allow undefined/null to easily hide component
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = "Error", message }) => {
  if (!message) {
    return null; // Don't render anything if no message
  }

  return (
    <Alert status="error" mb={4} borderRadius="md">
      <AlertIcon />
      <Box>
         <AlertTitle>{title}</AlertTitle>
         <AlertDescription>{message}</AlertDescription>
      </Box>
    </Alert>
  );
};

export default ErrorMessage;