// components/Article/MarkdownToolbar.tsx
import React, { RefObject } from 'react';
import { Button, ButtonGroup, Wrap, WrapItem, Tooltip, IconButton, Select, Box } from '@chakra-ui/react';
import {
  FaBold, FaItalic, FaLink, FaCode, FaListUl, FaListOl, FaQuoteLeft, FaImage, FaHeading, FaMinus,
  FaMusic, FaVideo, FaBook // Import media icons
} from 'react-icons/fa';

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement>; // Ref to the textarea element
  onContentChange: (value: string) => void; // Function to update the parent's state
  // Callbacks to open the upload modals
  onOpenAudioModal: () => void;
  onOpenImageModal: () => void;
  onOpenVideoModal: () => void;
  // Source management
  onOpenSourceManager?: () => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  onContentChange,
  onOpenAudioModal,
  onOpenVideoModal,
  onOpenImageModal,
  onOpenSourceManager
}) => {

  // Helper function to wrap selected text or insert placeholder
  const applyMarkdown = (syntaxStart: string, syntaxEnd: string = syntaxStart, placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newValue;

    if (selectedText) {
      newValue = `${textarea.value.substring(0, start)}${syntaxStart}${selectedText}${syntaxEnd}${textarea.value.substring(end)}`;
    } else {
      newValue = `${textarea.value.substring(0, start)}${syntaxStart}${placeholder}${syntaxEnd}${textarea.value.substring(end)}`;
    }
    onContentChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + syntaxStart.length, start + syntaxStart.length + selectedText.length);
      } else {
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
      const markerPrefix = lines.length > 1 ? lines.map(line => `${marker} ${line}`).join('\n') : `${marker} ${selectedText || 'List item'}`;
      const prefix = textarea.value.substring(0, start).endsWith('\n') || start === 0 ? '' : '\n';
      const suffix = textarea.value.substring(end).startsWith('\n') || end === textarea.value.length ? '' : '\n';

      const newValue = `${textarea.value.substring(0, start)}${prefix}${markerPrefix}${suffix}${textarea.value.substring(end)}`;
      onContentChange(newValue);

      setTimeout(() => {
         textarea.focus();
         // Select the inserted list item(s)
         textarea.setSelectionRange(start + prefix.length, start + prefix.length + markerPrefix.length);
      }, 0);
   }

   // Helper for headings
   const applyHeading = (level: number) => {
        if (!level) return; // Handle placeholder selection
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
              bg="white" // Ensure contrast
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
          <ButtonGroup size="sm" isAttached variant="outline" bg="white">
            <Tooltip label="Bold (Ctrl+B)" aria-label="Bold">
               <IconButton icon={<FaBold />} aria-label="Bold" onClick={() => applyMarkdown('**')} />
            </Tooltip>
            <Tooltip label="Italic (Ctrl+I)" aria-label="Italic">
               <IconButton icon={<FaItalic />} aria-label="Italic" onClick={() => applyMarkdown('*')} />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>

        {/* Links */}
         <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline" bg="white">
             <Tooltip label="Insert Link (Ctrl+K)" aria-label="Insert Link">
               <IconButton icon={<FaLink />} aria-label="Insert Link" onClick={() => applyMarkdown('[', '](url)', 'link text')} />
            </Tooltip>
             {/* Image button might need modal too for alt text etc. */}
             {/* <Tooltip label="Insert Image" aria-label="Insert Image"><IconButton icon={<FaImage />} aria-label="Insert Image" onClick={() => applyMarkdown('![', '](imageUrl)', 'alt text')} /></Tooltip> */}
          </ButtonGroup>
        </WrapItem>

         {/* Lists */}
         <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline" bg="white">
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
          <ButtonGroup size="sm" isAttached variant="outline" bg="white">
             <Tooltip label="Blockquote" aria-label="Blockquote">
              <IconButton icon={<FaQuoteLeft />} aria-label="Blockquote" onClick={() => applyMarkdown('> ', '', 'Quote')} />
            </Tooltip>
            <Tooltip label="Code Block" aria-label="Code Block">
              <IconButton icon={<FaCode />} aria-label="Code Block" onClick={() => applyMarkdown('\n```\n', '\n```', 'code')} />
            </Tooltip>
             <Tooltip label="Horizontal Rule" aria-label="Horizontal Rule">
              <IconButton icon={<FaMinus />} aria-label="Horizontal Rule" onClick={() => onContentChange(textareaRef.current ? `${textareaRef.current.value}\n\n---\n` : '\n---\n')} />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>

        {/* Media Upload Buttons */}
        <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline" bg="white">
            <Tooltip label="Upload/Insert Audio" aria-label="Upload Audio">
               <IconButton icon={<FaMusic />} aria-label="Upload Audio" onClick={onOpenAudioModal} />
            </Tooltip>
            <Tooltip label="Upload/Insert Video" aria-label="Upload Video">
               <IconButton icon={<FaVideo />} aria-label="Upload Video" onClick={onOpenVideoModal} />
            </Tooltip>
            <Tooltip label="Upload/Insert Image" aria-label="Upload Image">
              <IconButton icon={<FaImage />} aria-label="Upload Image" onClick={onOpenImageModal} />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>

        {/* Source Management */}
        {onOpenSourceManager && (
          <WrapItem>
            <ButtonGroup size="sm" isAttached variant="outline" bg="white">
              <Tooltip label="Manage Sources & References" aria-label="Manage Sources">
                <IconButton icon={<FaBook />} aria-label="Manage Sources" onClick={onOpenSourceManager} />
              </Tooltip>
            </ButtonGroup>
          </WrapItem>
        )}

      </Wrap>
    </Box>
  );
};

export default MarkdownToolbar;