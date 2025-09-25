// components/Article/ArticleViewer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Link as ChakraLink, Text, Code, Heading, List, ListItem, Image, AspectRatio } from '@chakra-ui/react';
import Link from 'next/link'; // For internal Wikilinks
import remarkSlug from 'remark-slug'; // Adds slugs (IDs) to headings
import rehypeRaw from 'rehype-raw'; // Allows raw HTML in markdown
// Type for plugins - using any for now to avoid type issues
// Type for AST Root - using any for now to avoid import issues
import { visit } from 'unist-util-visit'; // Utility for visiting AST nodes
import AudioPlayer from '../Media/AudioPlayer';
import ArticleSources from './ArticleSources';

/**
 * Defines the structure for headings extracted for Table of Contents.
 */
export interface ExtractedHeading {
  id: string;
  level: number; // 1 for h1, 2 for h2, etc.
  text: string;
}

/**
 * Props for the ArticleViewer component.
 */
interface ArticleViewerProps {
  /** The raw Markdown content string. */
  content: string;
  /** Optional callback function invoked with extracted headings. */
  onHeadingsExtracted?: (headings: ExtractedHeading[]) => void;
  /** Article title for reference lookup */
  articleTitle?: string;
}

// Helper function to recursively get text content from Markdown AST nodes
const getNodeText = (node: any): string => {
  let text = '';
  visit(node, 'text', (textNode: { value: string }) => {
    text += textNode.value;
  });
  return text;
};


// Custom Remark plugin factory to extract headings and their IDs/levels
const remarkExtractHeadings = (options: { onHeadingsExtracted?: (headings: ExtractedHeading[]) => void }): (tree: any) => void => {
  return (tree: any) => {
    // Only proceed if the callback function is actually provided
    if (!options.onHeadingsExtracted) {
        return;
    }
    const headings: ExtractedHeading[] = [];
    visit(tree, 'heading', (node) => {
      // remark-slug adds the ID to node.data.hProperties.id
      const id = node.data?.hProperties?.id || node.data?.id || '';
      const level = node.depth; // h1 = 1, h2 = 2, etc.
      const text = getNodeText(node); // Get text content

      // Only add if we successfully got an ID and text
      if (id && text) {
            headings.push({ id, level, text });
       }
    });
     // Call the provided callback function with the extracted headings
     options.onHeadingsExtracted(headings);
  };
};


// Helper function to normalize titles for Wikilinks (replace spaces with underscores)
const normalizeWikiTitle = (title: string): string => {
    return title.trim().replace(/\s+/g, '_');
};

/**
 * Renders Markdown content, handling standard elements, Wikilinks,
 * and custom embedded media tags ([[Audio:ID]], [[Video:ID]]).
 */
const ArticleViewer: React.FC<ArticleViewerProps> = ({ content, onHeadingsExtracted = () => {}, articleTitle }) => {

  // Configure Remark plugins: add IDs to headings, then extract them
  const remarkPlugins: any[] = [
    remarkSlug,
    [remarkExtractHeadings, { onHeadingsExtracted }],
  ];

  // Retrieve the base URL for backend API calls (streaming endpoints)
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, ''); // Ensure no trailing slash

  // Preprocess the raw Markdown content:
  // Replace media tags with HTML img/video/audio tags directly
  const processedContent = content
    // Process footnote references [^1] -> clickable footnotes
    .replace(
      /\[\^(\d+)\]/g,
      (match, refNumber) => {
        return `<sup><a href="#ref-${refNumber}" id="ref-link-${refNumber}" style="color: #3182ce; text-decoration: none; font-weight: bold;">[${refNumber}]</a></sup>`;
      }
    )
    .replace(
      /\[\[Image:(\d+)]]/g, // Match [[Image:ID]]
      (match, id) => {
          const streamUrl = `${API_BASE_URL}/images/stream/${id}`;
          return `<img src="${streamUrl}" alt="Image ${id}" style="max-width: 640px; max-height: 200px; border-radius: 8px; margin: 16px 0;" />`;
      }
  ).replace(
      /\[\[Video:(\d+)]]/g, // Match [[Video:ID]]
      (match, id) => {
          const streamUrl = `${API_BASE_URL}/videos/stream/${id}`;
          return `<video controls style="max-width: 640px; width: 100%; border-radius: 8px; margin: 16px 0;"><source src="${streamUrl}" type="video/mp4">Your browser does not support video playback.</video>`;
      }
  ).replace(
      /\[\[Audio:(\d+)]]/g, // Match [[Audio:ID]]
      (match, id) => {
          const streamUrl = `${API_BASE_URL}/music/stream/${id}`;
          return `<audio controls style="width: 100%; margin: 16px 0;"><source src="${streamUrl}" type="audio/mpeg">Your browser does not support audio playback.</audio>`;
      }
  );

  // Debug: Check if HTML is being generated correctly
  if (processedContent.includes('<img')) {
    console.log("✅ HTML img tags detected in processed content");
  }

  return (
    <Box className="markdown-content"> {/* Optional class for global styling */}
      <ReactMarkdown
         remarkPlugins={remarkPlugins}
         rehypePlugins={[rehypeRaw]} // Allow raw HTML processing
         children={processedContent} // Render the preprocessed content
         // Define custom renderers for specific HTML elements
         components={{
            // --- Block Element Renderers ---
            h1: ({node, id, ...props}) => <Heading id={id} as="h1" size="2xl" my={6} pt={4} {...props} />,
            h2: ({node, id, ...props}) => <Heading id={id} as="h2" size="xl" my={5} pt={3} borderBottomWidth="1px" pb={1} {...props} />,
            h3: ({node, id, ...props}) => <Heading id={id} as="h3" size="lg" my={4} pt={2} {...props} />,
            h4: ({node, id, ...props}) => <Heading id={id} as="h4" size="md" my={3} pt={1} {...props} />,
            h5: ({node, id, ...props}) => <Heading id={id} as="h5" size="sm" my={2} {...props} />,
            h6: ({node, id, ...props}) => <Heading id={id} as="h6" size="xs" my={2} {...props} />,
            p: ({node, ...props}) => <Text my={4} lineHeight="tall" {...props} />,
            ul: ({node, ...props}) => <List styleType="disc" pl={6} my={4} {...props} />,
            ol: ({node, ...props}) => <List as="ol" styleType="decimal" pl={6} my={4} {...props} />,
            li: ({node, ...props}) => <ListItem my={1} {...props} />,
            blockquote: ({node, ...props}) => <Box as="blockquote" borderLeftWidth="4px" borderColor="teal.200" bg="teal.50" pl={4} py={2} my={4} color="gray.700" fontStyle="italic" {...props} />,
            hr: ({node, ...props}) => <Box as="hr" my={8} borderColor="gray.200" {...props} />,
            img: ({node, ...props}) => <Image my={4} maxW="100%" borderRadius="md" boxShadow="sm" {...props as any} alt={props.alt || ''} />,
             code: ({node, inline, className, children, ...props}: any) => {
                const match = /language-(\w+)/.exec(className || '');
                // Basic check for block vs inline code
                const isBlock = node?.position?.start?.line !== node?.position?.end?.line || String(children).includes('\n');
                 return !inline && isBlock ? (
                  <Box as="pre" p={4} my={4} bg="gray.800" color="gray.100" borderRadius="md" overflowX="auto" fontSize="sm">
                    <Code className={className} bg="transparent" color="inherit" p={0} {...props}>
                      {children}
                    </Code>
                  </Box>
                ) : (
                  <Code px="0.3em" py="0.1em" borderRadius="sm" bg="gray.100" color="purple.600" fontSize="0.9em" {...props}>
                    {children}
                  </Code>
                );
              },

            // --- Inline Element Renderers ---

            // Custom renderer for Anchor <a> tags to handle Wikilinks and Standard links
            a: ({node, href, children, ...props}) => {
                // Check for wikilinks
                const nodeText = getNodeText(node);
                const wikilinkMatch = nodeText?.match(/^\[\[(.+?)]]$/); 
                let potentialHrefForWikilink = href; 
                 if (!potentialHrefForWikilink?.startsWith('[[')) {
                    potentialHrefForWikilink = node?.properties?.href as string 
                 }

                // Process as wikilink
                if (potentialHrefForWikilink?.match(/^\[\[.+?]]$/)) { 
                   const titleMatch = potentialHrefForWikilink.match(/^\[\[([^|]+?)(\|.+)?]]$/);
                   if (titleMatch && titleMatch[1]) {
                     const pageTitle = titleMatch[1];
                     const normalizedTitle = normalizeWikiTitle(pageTitle);
                     const displayChildren = (children && String(children).trim() !== '') ? children : pageTitle.replace(/_/g, ' ');

                     return (
                       <Link href={`/wiki/${normalizedTitle}`} passHref>
                         <ChakraLink color="teal.600" _hover={{ textDecoration: 'underline', color: 'teal.800' }} fontWeight="medium" {...props}>
                           {displayChildren}
                         </ChakraLink>
                       </Link>
                     );
                   }
                }

                const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
                return (
                  <ChakraLink
                    href={href} // Use the href provided by react-markdown
                    isExternal={isExternal}
                    color="teal.600"
                    _hover={{ textDecoration: 'underline', color: 'teal.800' }}
                    fontWeight="medium"
                    {...props} // Pass down other props like title, target etc.
                  >
                    {children}
                  </ChakraLink>
                );
            },
            // Standard inline elements
            strong: ({node, ...props}) => <Text as="strong" fontWeight="semibold" {...props} />,
            em: ({node, ...props}) => <Text as="em" fontStyle="italic" {...props} />,
         }}
      />
      {articleTitle && (
        <ArticleSources 
          articleTitle={articleTitle}
          showTitle={true}
        />
      )}
    </Box>
  );
};

export default ArticleViewer;