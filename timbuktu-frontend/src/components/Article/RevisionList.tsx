// components/Article/RevisionList.tsx
import React from 'react';
import { Box, List, ListItem, Text, Badge, Link as ChakraLink, Divider } from '@chakra-ui/react';
import { Revision } from '@/types'; // Adjust path

interface RevisionListProps {
  revisions: Revision[];
  articleTitle: string; // Normalized title for potential future diff links
}

const RevisionList: React.FC<RevisionListProps> = ({ revisions, articleTitle }) => {
  if (!revisions || revisions.length === 0) {
    return <Text>No revision history found for this article.</Text>;
  }

  return (
    <List spacing={5} mt={4}>
      {revisions.map((revision, index) => (
        <ListItem key={revision.id} pb={5} borderBottomWidth={index < revisions.length - 1 ? '1px' : '0px'} borderColor="gray.200">
          <Box>
            <Text fontSize="lg" fontWeight="medium">
              {new Date(revision.timestamp).toLocaleString()} {/* Format timestamp */}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Edited by: {' '}
              <Badge colorScheme={revision.user ? 'blue' : 'gray'}>
                {revision.user ? revision.user.username : 'Anonymous'}
              </Badge>
              {/* Optional: Link to user profile page in future */}
            </Text>
            {revision.comment && (
               <Text fontSize="sm" mt={1} fontStyle="italic" color="gray.700">
                Comment: {revision.comment}
               </Text>
            )}
             {/* Optional: Add links to view specific revision or compare revisions (diff view) */}
             {/*
             <ChakraLink href={`/wiki/${articleTitle}?revision=${revision.id}`} fontSize="sm" color="teal.500" mt={2} display="inline-block">
                View this revision
             </ChakraLink>
             */}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default RevisionList;