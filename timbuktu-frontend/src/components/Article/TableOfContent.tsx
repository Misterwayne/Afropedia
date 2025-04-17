import React from 'react';
import { Box, List, ListItem, Link as ChakraLink, Text } from '@chakra-ui/react';
import { ExtractedHeading } from './ArticleViewer'; // Import the type

interface TableOfContentsProps {
  headings: ExtractedHeading[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  if (!headings || headings.length === 0) {
    return null; // Don't render if no headings
  }

  return (
    // Use position sticky for scroll-along effect (within its parent container)
    // Adjust 'top' based on your navbar height
    <Box
       as="nav"
       aria-labelledby="toc-heading"
       position="sticky"
       top="8rem" // Example: Adjust this based on your actual nav height + desired spacing
       maxH="calc(100vh - 10rem)" // Limit height to prevent overflow, adjust calculation
       overflowY="auto"
       pr={4} // Padding on the right
       borderLeftWidth="1px" // Subtle separator
       borderColor="gray.200"
       pl={4} // Padding on the left
       fontSize="sm" // Smaller font size for ToC
    >
      <Text id="toc-heading" fontWeight="bold" mb={3} fontSize="md" color="gray.700">
        Table of Contents
      </Text>
      <List spacing={1}>
        {headings.map((heading) => (
          <ListItem key={heading.id} pl={`${(heading.level - 1) * 1.5}rem`}> {/* Indentation based on level */}
            <ChakraLink
              href={`#${heading.id}`} // Link to the heading ID
              display="block"
              py={1}
              color="gray.600"
              _hover={{
                color: 'teal.600',
                textDecoration: 'none', // Avoid underline if not desired
                bg: 'gray.50', // Subtle background hover
              }}
              // Optional: Add active state highlighting based on scroll position (more advanced)
            >
              {heading.text}
            </ChakraLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TableOfContents;