# Source and Reference System

This document describes the source and reference system implemented for Afropedia, similar to Wikipedia's citation system.

## Overview

The source system allows articles to have numbered references that link to external sources like books, websites, journals, and newspapers. This provides credibility and allows readers to verify information.

## Database Schema

### Source Table
Stores information about sources that can be referenced in articles.

```sql
CREATE TABLE source (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    url TEXT,
    author VARCHAR(200),
    publication VARCHAR(200),
    publication_date TIMESTAMP WITH TIME ZONE,
    access_date TIMESTAMP WITH TIME ZONE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'web',
    isbn VARCHAR(20),
    doi VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES "user"(id)
);
```

### Reference Table
Links sources to articles with reference numbers.

```sql
CREATE TABLE reference (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES article(id) ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES source(id) ON DELETE CASCADE,
    reference_number INTEGER NOT NULL,
    context TEXT,
    page_number VARCHAR(50),
    section VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES "user"(id),
    UNIQUE(article_id, reference_number)
);
```

## Source Types

- **web**: Websites, online articles
- **book**: Books, textbooks
- **journal**: Academic journals, research papers
- **newspaper**: Newspaper articles
- **other**: Other types of sources

## API Endpoints

### Sources
- `POST /sources/sources` - Create a new source
- `GET /sources/sources/{source_id}` - Get source by ID
- `PUT /sources/sources/{source_id}` - Update source
- `DELETE /sources/sources/{source_id}` - Delete source

### References
- `POST /sources/articles/{article_id}/references` - Create reference for article
- `GET /sources/articles/{article_id}/references` - Get all references for article
- `PUT /sources/references/{reference_id}` - Update reference
- `DELETE /sources/references/{reference_id}` - Delete reference

### Articles
- `GET /articles/{title}/references` - Get references for article by title

## Usage Examples

### Creating a Source
```python
source_data = {
    'title': 'The Kingdom of Axum: A Historical Overview',
    'url': 'https://example.com/axum-kingdom',
    'author': 'Dr. Sarah Johnson',
    'publication': 'African History Quarterly',
    'source_type': 'journal',
    'doi': '10.1000/axum-history-2023'
}
```

### Creating a Reference
```python
reference_data = {
    'article_id': 1,
    'source_id': 5,
    'reference_number': 1,
    'context': 'The Axum Kingdom was one of the most powerful states',
    'page_number': '45'
}
```

## Frontend Components

### SourceManager
- Manage sources and references for an article
- Add, edit, delete sources
- Automatically create references when adding sources

### ReferencesSection
- Display formatted references at the bottom of articles
- Support for different source types with appropriate formatting
- Collapsible view for long reference lists

## Reference Formatting

The system automatically formats references based on source type:

### Web Sources
```
Author. "Title". Publication. URL. Accessed: Date.
```

### Books
```
Author. "Title". Publisher. ISBN: 1234567890.
```

### Journals
```
Author. "Title". Journal Name. Year. DOI: 10.1000/example.
```

### Newspapers
```
Author. "Title". Newspaper Name. Date.
```

## Setup Instructions

1. **Create Database Tables**
   ```bash
   # Run the SQL script in Supabase SQL Editor
   cat source_tables.sql
   ```

2. **Test the System**
   ```bash
   python test_source_system.py
   ```

3. **Start the Backend**
   ```bash
   uvicorn main:app --reload
   ```

4. **Test API Endpoints**
   ```bash
   # Create a source
   curl -X POST "http://localhost:8000/sources/sources" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title": "Test Source", "source_type": "web", "url": "https://example.com"}'
   ```

## Features

- ✅ Multiple source types (web, book, journal, newspaper)
- ✅ Automatic reference numbering
- ✅ Context tracking (text around references)
- ✅ Page numbers and sections for books
- ✅ DOI and ISBN support
- ✅ Access date tracking for web sources
- ✅ User ownership and permissions
- ✅ Automatic reference formatting
- ✅ Frontend management interface
- ✅ Reference validation
- ✅ Row Level Security (RLS)

## Future Enhancements

- [ ] Bulk source import
- [ ] Reference templates
- [ ] Citation style options (APA, MLA, Chicago)
- [ ] Source verification system
- [ ] Reference analytics
- [ ] Duplicate source detection
- [ ] Source quality scoring
