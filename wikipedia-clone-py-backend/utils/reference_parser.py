# utils/reference_parser.py
import re
from typing import List, Dict, Tuple, Optional
from datetime import datetime

def parse_references_from_markdown(content: str) -> List[Dict]:
    """
    Parse Wikipedia-style references from markdown content.
    
    Supports formats like:
    - [1] or [1][2] (multiple references)
    - [^1] (footnote style)
    - {{ref|1}} (template style)
    
    Returns a list of reference dictionaries with:
    - reference_number: The number in the text
    - context: The surrounding text
    - position: Character position in content
    """
    references = []
    
    # Pattern 1: [1] or [1][2] format
    pattern1 = r'\[(\d+)\](?:\[(\d+)\])*'
    for match in re.finditer(pattern1, content):
        ref_numbers = [match.group(1)]
        if match.group(2):
            ref_numbers.extend(match.group(2).split(']['))
        
        for ref_num in ref_numbers:
            # Get context around the reference (50 chars before and after)
            start = max(0, match.start() - 50)
            end = min(len(content), match.end() + 50)
            context = content[start:end]
            
            references.append({
                'reference_number': int(ref_num),
                'context': context.strip(),
                'position': match.start(),
                'type': 'bracket'
            })
    
    # Pattern 2: [^1] footnote style
    pattern2 = r'\[\^(\d+)\]'
    for match in re.finditer(pattern2, content):
        ref_num = match.group(1)
        start = max(0, match.start() - 50)
        end = min(len(content), match.end() + 50)
        context = content[start:end]
        
        references.append({
            'reference_number': int(ref_num),
            'context': context.strip(),
            'position': match.start(),
            'type': 'footnote'
        })
    
    # Pattern 3: {{ref|1}} template style
    pattern3 = r'\{\{ref\|(\d+)\}\}'
    for match in re.finditer(pattern3, content):
        ref_num = match.group(1)
        start = max(0, match.start() - 50)
        end = min(len(content), match.end() + 50)
        context = content[start:end]
        
        references.append({
            'reference_number': int(ref_num),
            'context': context.strip(),
            'position': match.start(),
            'type': 'template'
        })
    
    # Sort by position in content
    references.sort(key=lambda x: x['position'])
    
    return references

def extract_reference_numbers(content: str) -> List[int]:
    """Extract all reference numbers from content"""
    references = parse_references_from_markdown(content)
    return [ref['reference_number'] for ref in references]

def validate_references(content: str, existing_references: List[Dict]) -> Dict:
    """
    Validate that all references in content have corresponding source entries.
    
    Returns:
    - valid: bool
    - missing_refs: List[int] - reference numbers that don't have sources
    - extra_refs: List[int] - source numbers that aren't referenced
    - errors: List[str] - validation error messages
    """
    content_refs = set(extract_reference_numbers(content))
    existing_refs = set(ref.get('reference_number', 0) for ref in existing_references)
    
    missing_refs = list(content_refs - existing_refs)
    extra_refs = list(existing_refs - content_refs)
    
    errors = []
    if missing_refs:
        errors.append(f"Missing sources for references: {missing_refs}")
    if extra_refs:
        errors.append(f"Unused sources: {extra_refs}")
    
    return {
        'valid': len(errors) == 0,
        'missing_refs': missing_refs,
        'extra_refs': extra_refs,
        'errors': errors
    }

def format_reference_display(reference: Dict, source: Dict) -> str:
    """
    Format a reference for display in the references section.
    
    Supports different source types with appropriate formatting.
    """
    if reference['source']['source_type'] == 'web':
        if reference['source']['author'] and reference['source']['publication']:
            return f"{reference['source']['author']}. \"{reference['source']['title']}\". {reference['source']['publication']}. {reference['source']['url']}"
        elif reference['source']['author']:
            return f"{reference['source']['author']}. \"{reference['source']['title']}\". {reference['source']['url']}"
        else:
            return f"\"{reference['source']['title']}\". {reference['source']['url']}"
    
    elif reference['source']['source_type'] == 'book':
        author = reference['source']['author'] or "Unknown Author"
        title = reference['source']['title']
        publication = reference['source']['publication'] or "Unknown Publisher"
        isbn = reference['source']['isbn']
        
        result = f"{author}. \"{title}\". {publication}"
        if isbn:
            result += f". ISBN: {isbn}"
        return result
    
    elif reference['source']['source_type'] == 'journal':
        author = reference['source']['author'] or "Unknown Author"
        title = reference['source']['title']
        journal = reference['source']['publication'] or "Unknown Journal"
        doi = reference['source']['doi']
        
        result = f"{author}. \"{title}\". {journal}"
        if doi:
            result += f". DOI: {doi}"
        return result
    
    elif reference['source']['source_type'] == 'newspaper':
        author = reference['source']['author'] or "Unknown Author"
        title = reference['source']['title']
        publication = reference['source']['publication'] or "Unknown Newspaper"
        pub_date = reference['source']['publication_date']
        
        result = f"{author}. \"{title}\". {publication}"
        if pub_date:
            result += f". {pub_date}"
        return result
    
    else:
        # Generic format
        author = reference['source']['author'] or "Unknown Author"
        title = reference['source']['title']
        publication = reference['source']['publication']
        
        result = f"{author}. \"{title}\""
        if publication:
            result += f". {publication}"
        return result

def generate_references_section(references: List[Dict]) -> str:
    """
    Generate a formatted references section for display.
    """
    if not references:
        return ""
    
    section = "\n\n## References\n\n"
    
    for ref in references:
        formatted_ref = format_reference_display(ref, ref['source'])
        section += f"{ref['reference_number']}. {formatted_ref}\n"
    
    return section

def clean_reference_markup(content: str) -> str:
    """
    Remove reference markup from content for clean display.
    """
    # Remove [1] style references
    content = re.sub(r'\[\d+\](?:\[\d+\])*', '', content)
    
    # Remove [^1] footnote references
    content = re.sub(r'\[\^\d+\]', '', content)
    
    # Remove {{ref|1}} template references
    content = re.sub(r'\{\{ref\|\d+\}\}', '', content)
    
    return content
