// components/UI/StandardComponents.tsx
// Standardized UI components for consistent user experience

import React from 'react';
import {
  Box,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  CircularProgressLabel,
  Progress,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiInfo } from 'react-icons/fi';

// Standard Loading States
interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  variant?: 'spinner' | 'circular' | 'progress';
  progress?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  message = 'Loading...',
  variant = 'spinner',
  progress
}) => {
  const color = useColorModeValue('blue.500', 'blue.300');
  
  return (
    <VStack spacing={4} py={8}>
      {variant === 'spinner' && <Spinner size={size} color={color} />}
      {variant === 'circular' && (
        <CircularProgress
          size={size === 'sm' ? '40px' : size === 'md' ? '60px' : size === 'lg' ? '80px' : '100px'}
          color={color}
          isIndeterminate={progress === undefined}
          value={progress}
        >
          {progress !== undefined && (
            <CircularProgressLabel>{Math.round(progress)}%</CircularProgressLabel>
          )}
        </CircularProgress>
      )}
      {variant === 'progress' && (
        <Box w="100%" maxW="300px">
          <Progress
            value={progress || 0}
            colorScheme="blue"
            size="lg"
            borderRadius="md"
          />
        </Box>
      )}
      <Text fontSize="sm" color="gray.500" textAlign="center">
        {message}
      </Text>
    </VStack>
  );
};

// Standard Error States
interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  details,
  variant = 'error',
  onRetry,
  retryLabel = 'Try Again'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'error': return FiAlertCircle;
      case 'warning': return FiAlertCircle;
      case 'info': return FiInfo;
      default: return FiAlertCircle;
    }
  };

  const getStatus = () => {
    switch (variant) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'error';
    }
  };

  return (
    <Alert status={getStatus()} borderRadius="md" flexDirection="column" alignItems="center" textAlign="center">
      <AlertIcon as={getIcon()} boxSize="6" />
      <AlertTitle fontSize="lg" mb={2}>
        {title}
      </AlertTitle>
      <AlertDescription maxW="sm">
        <Text mb={2}>{message}</Text>
        {details && (
          <Text fontSize="sm" color="gray.500" mb={4}>
            {details}
          </Text>
        )}
        {onRetry && (
          <Button size="sm" colorScheme="blue" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Standard Empty States
interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon: IconComponent = FiInfo,
  action
}) => {
  const color = useColorModeValue('gray.400', 'gray.600');
  
  return (
    <VStack spacing={4} py={12} textAlign="center">
      <Icon as={IconComponent} boxSize="12" color={color} />
      <Text fontSize="lg" fontWeight="semibold" color="gray.600">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="sm">
        {message}
      </Text>
      {action && (
        <Button colorScheme="blue" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </VStack>
  );
};

// Standard Status Badges
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColorScheme = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'published':
      case 'active':
      case 'completed':
        return 'green';
      case 'pending':
      case 'draft':
      case 'in_progress':
        return 'yellow';
      case 'rejected':
      case 'archived':
      case 'inactive':
      case 'failed':
        return 'red';
      case 'review':
      case 'moderation':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'published':
      case 'completed':
        return FiCheckCircle;
      case 'pending':
      case 'draft':
        return FiClock;
      case 'rejected':
      case 'failed':
        return FiAlertCircle;
      default:
        return FiInfo;
    }
  };

  return (
    <HStack spacing={1}>
      <Icon as={getIcon(status)} boxSize={size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px'} />
      <Text fontSize={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'} fontWeight="medium">
        {status}
      </Text>
    </HStack>
  );
};

// Standard Action Buttons
interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: React.ElementType;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: IconComponent
}) => {
  const getColorScheme = () => {
    switch (variant) {
      case 'primary': return 'blue';
      case 'secondary': return 'gray';
      case 'danger': return 'red';
      case 'ghost': return 'gray';
      default: return 'blue';
    }
  };

  const getVariant = () => {
    switch (variant) {
      case 'primary': return 'solid';
      case 'secondary': return 'outline';
      case 'danger': return 'solid';
      case 'ghost': return 'ghost';
      default: return 'solid';
    }
  };

  return (
    <Button
      colorScheme={getColorScheme()}
      variant={getVariant()}
      size={size}
      onClick={onClick}
      isLoading={isLoading}
      isDisabled={isDisabled}
      leftIcon={IconComponent ? <Icon as={IconComponent} /> : undefined}
    >
      {label}
    </Button>
  );
};

// Standard Page Header
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs
}) => {
  return (
    <Box mb={6}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <HStack spacing={2} mb={4} fontSize="sm" color="gray.500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Text>/</Text>}
              {crumb.href ? (
                <Text as="a" href={crumb.href} color="blue.500" _hover={{ textDecoration: 'underline' }}>
                  {crumb.label}
                </Text>
              ) : (
                <Text>{crumb.label}</Text>
              )}
            </React.Fragment>
          ))}
        </HStack>
      )}
      <Flex align="center" justify="space-between">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="md" color="gray.600" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
        {actions && (
          <HStack spacing={3}>
            {actions}
          </HStack>
        )}
      </Flex>
    </Box>
  );
};
