import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Link as ChakraLink, Text, Code, Heading, List, ListItem, Image } from '@chakra-ui/react';
import Link from 'next/link';
import remarkSlug from 'remark-slug'; // Import remark-slug
import { PluggableList } from 'react-markdown/lib/react-markdown'; // Type for plugins (not used)
import { Root } from 'remark-parse/lib'; // Import Root type for plugin
import { visit } from 'unist-util-visit'; // Utility for traversing the AST

// Define the shape of an extracted heading
export interface ExtractedHeading {
  id: string;
  level: number; // 1 for h1, 2 for h2, etc.
  text: string;
}

interface ArticleViewerProps {
  content: string;
  // Callback to pass extracted headings back up to the parent page
  onHeadingsExtracted: (headings: ExtractedHeading[]) => void;
}

// Helper function to get text content from heading nodes
const getNodeText = (node: any): string => {
  let text = '';
  visit(node, 'text', (textNode: { value: string }) => {
    text += textNode.value;
  });
  return text;
};


// Custom Remark plugin to extract headings
const remarkExtractHeadings = (options: { onHeadingsExtracted: (headings: ExtractedHeading[]) => void }): (tree: Root) => void => {
  return (tree: Root) => {
    const headings: ExtractedHeading[] = [];
    visit(tree, 'heading', (node) => {
      // remark-slug should have added an ID in node.data.id or node.data.hProperties.id
      // Let's check both common locations
      const id = node.data?.hProperties?.id || node.data?.id || ''; // Get the ID added by remark-slug
      const level = node.depth; // h1 = 1, h2 = 2, etc.
      const text = getNodeText(node); // Extract text content

       if (id && text) { // Only add if we have an ID and text
            headings.push({ id, level, text });
       }

    });
     // Call the callback function provided in options
     options.onHeadingsExtracted(headings);
  };
};


// Helper function to normalize titles for Wikilinks (remains the same)
const normalizeWikiTitle = (title: string): string => {
    return title.trim().replace(/\s+/g, '_');
};

const ArticleViewer: React.FC<ArticleViewerProps> = ({ content, onHeadingsExtracted }) => {

  // Create the plugin list, including slug and our custom extractor
  const remarkPlugins: PluggableList = [
    remarkSlug, // Adds IDs to headings first
    [remarkExtractHeadings, { onHeadingsExtracted }], // Then extract them
  ];

  return (
    <Box className="markdown-content"> {/* Removed mt={4} - handle spacing in parent */}
      <ReactMarkdown
         remarkPlugins={remarkPlugins} // Use the configured plugins
         components={{
            // --- Block Elements ---
            // Add ID prop to Heading components so links work
            h1: ({node, ...props}) => <Heading id={props.id} as="h1" size="2xl" my={6} pt={4} {...props} />,
            h2: ({node, ...props}) => <Heading id={props.id} as="h2" size="xl" my={5} pt={3} borderBottomWidth="1px" pb={1} {...props} />,
            h3: ({node, ...props}) => <Heading id={props.id} as="h3" size="lg" my={4} pt={2} {...props} />,
            h4: ({node, ...props}) => <Heading id={props.id} as="h4" size="md" my={3} pt={1} {...props} />,
            h5: ({node, ...props}) => <Heading id={props.id} as="h5" size="sm" my={2} {...props} />,
            h6: ({node, ...props}) => <Heading id={props.id} as="h6" size="xs" my={2} {...props} />,
            p: ({node, ...props}) => <Text my={4} lineHeight="tall" {...props} />, // Improve readability
            ul: ({node, ...props}) => <List styleType="disc" pl={6} my={4} {...props} />, // Increased padding
            ol: ({node, ...props}) => <List as="ol" styleType="decimal" pl={6} my={4} {...props} />, // Increased padding
            li: ({node, ...props}) => <ListItem my={1} {...props} />,
            blockquote: ({node, ...props}) => <Box as="blockquote" borderLeftWidth="4px" borderColor="teal.200" bg="teal.50" pl={4} py={2} my={4} color="gray.700" fontStyle="italic" {...props} />, // Themed blockquote
            hr: ({node, ...props}) => <Box as="hr" my={8} borderColor="gray.200" {...props} />,
            img: ({node, ...props}) => <Image my={4} maxW="100%" borderRadius="md" boxShadow="sm" {...props as any} alt={props.alt || ''} />,

            // --- Inline Elements (code, a, strong, em remain largely the same) ---
             code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                // Basic check for common code block scenarios vs inline
                const isBlock = node?.position?.start?.line !== node?.position?.end?.line || String(children).includes('\n');
                 return !inline && isBlock ? (
                  <Box as="pre" p={4} my={4} bg="gray.800" color="gray.100" borderRadius="md" overflowX="auto" fontSize="sm"> {/* Dark code block */}
                    <Code className={className} bg="transparent" color="inherit" p={0} {...props}>
                      {children}
                    </Code>
                  </Box>
                ) : (
                  <Code px="0.3em" py="0.1em" borderRadius="sm" bg="gray.100" color="purple.600" fontSize="0.9em" {...props}> {/* Slightly smaller inline code */}
                    {children}
                  </Code>
                );
              },
             a: ({node, href, children, ...props}) => {
                 const wikilinkMatch = href?.match(/^\[\[(.+?)]]$/);
                 if (wikilinkMatch && wikilinkMatch[1]) {
                     const pageTitle = wikilinkMatch[1];
                     const normalizedTitle = normalizeWikiTitle(pageTitle);
                     return (
                         <Link href={`/wiki/${normalizedTitle}`} passHref>
                             <ChakraLink color="teal.600" _hover={{ textDecoration: 'underline', color: 'teal.800' }} fontWeight="medium" {...props}>
                                 {children}
                             </ChakraLink>
                         </Link>
                     );
                 }
                 const isExternal = href?.startsWith('http');
                 return (
                     <ChakraLink
                         href={href}
                         isExternal={isExternal}
                         color="teal.600"
                         _hover={{ textDecoration: 'underline', color: 'teal.800' }}
                         fontWeight="medium"
                         {...props}
                     >
                         {children}
                     </ChakraLink>
                 );
             },
            strong: ({node, ...props}) => <Text as="strong" fontWeight="semibold" {...props} />, // Use semibold for less harshness
            em: ({node, ...props}) => <Text as="em" fontStyle="italic" {...props} />,
         }}
        >
           {content.replace(/\[\[(.+?)]]/g, (match, p1) => `[${p1}]([[${p1}]])`)}
        </ReactMarkdown>
    </Box>
  );
};

export default ArticleViewer;