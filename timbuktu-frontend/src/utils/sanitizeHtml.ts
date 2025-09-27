// utils/sanitizeHtml.ts
// Simple HTML sanitization for search highlights
// In production, consider using DOMPurify or similar library

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*>/gi, '') // Remove embed tags
    .replace(/<link\b[^<]*>/gi, '') // Remove link tags
    .replace(/<meta\b[^<]*>/gi, '') // Remove meta tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/<[^>]*>/g, (match) => {
      // Only allow safe tags for highlighting
      const allowedTags = ['b', 'strong', 'i', 'em', 'mark', 'span'];
      const tagName = match.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*).*/, '$1').toLowerCase();
      
      if (allowedTags.includes(tagName)) {
        // Only allow class and style attributes for highlighting
        const cleanMatch = match.replace(/\s+(on\w+|javascript:|vbscript:|data:)[^=]*="[^"]*"/gi, '');
        return cleanMatch;
      }
      
      return ''; // Remove disallowed tags
    });
}

export function createHighlightedText(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
