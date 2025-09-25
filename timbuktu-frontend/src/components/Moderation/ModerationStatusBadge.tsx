import React from 'react';
import { Badge, HStack, Text, Tooltip } from '@chakra-ui/react';

interface ModerationStatusBadgeProps {
  status: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ModerationStatusBadge: React.FC<ModerationStatusBadgeProps> = ({
  status,
  showLabel = true,
  size = 'md'
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          color: 'gray',
          label: 'Draft',
          description: 'Content is in draft state'
        };
      case 'pending':
        return {
          color: 'yellow',
          label: 'Pending Review',
          description: 'Awaiting moderation review'
        };
      case 'in_review':
        return {
          color: 'blue',
          label: 'In Review',
          description: 'Currently being reviewed'
        };
      case 'approved':
        return {
          color: 'green',
          label: 'Approved',
          description: 'Content has been approved'
        };
      case 'rejected':
        return {
          color: 'red',
          label: 'Rejected',
          description: 'Content has been rejected'
        };
      case 'featured':
        return {
          color: 'purple',
          label: 'Featured',
          description: 'Featured content'
        };
      default:
        return {
          color: 'gray',
          label: status,
          description: 'Unknown status'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tooltip label={config.description} hasArrow>
      <HStack spacing={1}>
        <Badge
          colorScheme={config.color}
          size={size}
          variant="solid"
        >
          {config.label}
        </Badge>
        {showLabel && (
          <Text fontSize="xs" color="gray.600">
            {config.description}
          </Text>
        )}
      </HStack>
    </Tooltip>
  );
};

export default ModerationStatusBadge;
