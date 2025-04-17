// components/Article/MarkdownToolbar.tsx
import React, { RefObject } from 'react';
import { Button, ButtonGroup, Wrap, WrapItem, Tooltip, IconButton, Select, Box } from '@chakra-ui/react';
import {
  FaBold, FaItalic, FaLink, FaCode, FaListUl, FaListOl, FaQuoteLeft, FaImage, FaHeading, FaMinus // Icons
} from 'react-icons/fa';

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement>; // Ref to the textarea element
  onContentChange: (value: string) => void; // Function to update the parent's state
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ textareaRef, onContentChange }) => {

  // Helper function to wrap selected text or insert placeholder
  const applyMarkdown = (syntaxStart: string, syntaxEnd: string = syntaxStart, placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newValue;

    if (selectedText) {
      // Wrap selected text
      newValue = `${textarea.value.substring(0, start)}${syntaxStart}${selectedText}${syntaxEnd}${textarea.value.substring(end)}`;
    } else {
      // Insert placeholder
      newValue = `${textarea.value.substring(0, start)}${syntaxStart}${placeholder}${syntaxEnd}${textarea.value.substring(end)}`;
    }

    onContentChange(newValue); // Update parent state

    // Set focus and selection after state update (needs slight delay)
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + selectedText.length);
      } else {
         // Place cursor within the placeholder or after syntax
         textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + placeholder.length);
      }
    }, 0);
  };

   // Helper for list items
   const applyList = (marker: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const lines = selectedText.split('\n');
      const newLines = lines.map(line => `${marker} ${line}`).join('\n');
      const prefix = textarea.value.substring(0, start).endsWith('\n') || start === 0 ? '' : '\n'; // Add newline if needed
      const suffix = textarea.value.substring(end).startsWith('\n') || end === textarea.value.length ? '' : '\n'; // Add newline if needed

      const newValue = `${textarea.value.substring(0, start)}${prefix}${newLines}${suffix}${textarea.value.substring(end)}`;
      onContentChange(newValue);

      setTimeout(() => {
         textarea.focus();
         textarea.setSelectionRange(start + prefix.length, start + prefix.length + newLines.length);
      }, 0);
   }

   // Helper for headings
   const applyHeading = (level: number) => {
        const marker = '#'.repeat(level);
        applyMarkdown(`${marker} `, '', `Heading ${level}`);
   }

  return (
    <Box p={2} borderWidth="1px" borderRadius="md" mb={3} bg="gray.50">
      <Wrap spacing={1}>
        {/* Headings Dropdown */}
        <WrapItem>
           <Select
              size="sm"
              placeholder="Heading"
              onChange={(e) => applyHeading(parseInt(e.target.value, 10))}
              w="100px"
              aria-label="Select Heading Level"
           >
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
           </Select>
        </WrapItem>

         {/* Basic Formatting */}
        <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Tooltip label="Bold (Ctrl+B)" aria-label="Bold">
               <IconButton icon={<FaBold />} aria-label="Bold" onClick={() => applyMarkdown('**')} />
            </Tooltip>
            <Tooltip label="Italic (Ctrl+I)" aria-label="Italic">
               <IconButton icon={<FaItalic />} aria-label="Italic" onClick={() => applyMarkdown('*')} />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>

        {/* Links & Images */}
         <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline">
             <Tooltip label="Insert Link (Ctrl+K)" aria-label="Insert Link">
               <IconButton icon={<FaLink />} aria-label="Insert Link" onClick={() => applyMarkdown('[', '](url)', 'link text')} />
            </Tooltip>
             {/* <Tooltip label="Insert Image" aria-label="Insert Image">
                <IconButton icon={<FaImage />} aria-label="Insert Image" onClick={() => applyMarkdown('![', '](imageUrl)', 'alt text')} />
             </Tooltip> */}
          </ButtonGroup>
        </WrapItem>

         {/* Lists */}
         <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Tooltip label="Bulleted List" aria-label="Bulleted List">
              <IconButton icon={<FaListUl />} aria-label="Bulleted List" onClick={() => applyList('*')} />
            </Tooltip>
            <Tooltip label="Numbered List" aria-label="Numbered List">
              <IconButton icon={<FaListOl />} aria-label="Numbered List" onClick={() => applyList('1.')} />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>

         {/* Block Elements */}
        <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline">
             <Tooltip label="Blockquote" aria-label="Blockquote">
              <IconButton icon={<FaQuoteLeft />} aria-label="Blockquote" onClick={() => applyMarkdown('> ', '', 'Quote')} />
            </Tooltip>
            <Tooltip label="Code Block" aria-label="Code Block">
              <IconButton icon={<FaCode />} aria-label="Code Block" onClick={() => applyMarkdown('```\n', '\n```', 'code')} />
            </Tooltip>
             <Tooltip label="Horizontal Rule" aria-label="Horizontal Rule">
              <IconButton icon={<FaMinus />} aria-label="Horizontal Rule" onClick={() => applyMarkdown('\n---\n', '', '')} />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>

         {/* Add more buttons as needed: Strikethrough, Inline Code, Tables etc. */}
      </Wrap>
    </Box>
  );
};

export default MarkdownToolbar;