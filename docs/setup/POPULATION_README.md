# Database Population Scripts for Afropedia

This directory contains scripts to populate the Afropedia database with sample data for development and testing purposes.

## Overview

The population scripts create realistic sample data for all entities in the Afropedia system:

- **Users**: 6 sample users with different roles (admin, editors, contributors, readers)
- **Articles**: 5 comprehensive articles about African history and culture
- **Books**: 6 classic African and African-American literature books
- **Music**: 5 sample music tracks with metadata
- **Videos**: 5 sample video files with metadata
- **Images**: 5 sample images with metadata

## Files

### Main Scripts

1. **`run_populate.py`** - Main entry point script that lets you choose between Supabase or SQLModel population
2. **`populate_supabase.py`** - Supabase-compatible population script (recommended for current setup)
3. **`populate_db.py`** - SQLModel/SQLAlchemy population script (for local database setups)

### Sample Data

The scripts include rich, realistic sample data:

#### Articles
- Ancient Egyptian Civilization
- Mansa Musa (the wealthiest person in history)
- Timbuktu (the legendary city)
- African Music Traditions
- Nelson Mandela

#### Books
- Things Fall Apart (Chinua Achebe)
- Half of a Yellow Sun (Chimamanda Ngozi Adichie)
- The Souls of Black Folk (W.E.B. Du Bois)
- Beloved (Toni Morrison)
- The Color Purple (Alice Walker)
- Roots (Alex Haley)

#### Music
- Fela Kuti - Water No Get Enemy
- Miriam Makeba - Pata Pata
- Salif Keita - Madan
- Youssou N'Dour - 7 Seconds
- Angelique Kidjo - Agolo

## Usage

### Prerequisites

1. **For Supabase setup** (recommended):
   - Ensure your `.env` file contains valid Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     ```

2. **For SQLModel setup**:
   - Ensure your database is running and accessible
   - Database tables should be created

### Running the Scripts

#### Option 1: Interactive Script (Recommended)
```bash
cd wikipedia-clone-py-backend
python run_populate.py
```

This will prompt you to choose between Supabase or SQLModel population.

#### Option 2: Direct Supabase Population
```bash
cd wikipedia-clone-py-backend
python populate_supabase.py
```

#### Option 3: Direct SQLModel Population
```bash
cd wikipedia-clone-py-backend
python populate_db.py
```

### Environment Setup

Make sure you have the required dependencies installed:

```bash
pip install -r requirements.txt
```

## Database Schema

The population scripts work with the following main entities:

### Core Entities
- **User**: Users with authentication information
- **Article**: Wiki articles with titles and metadata
- **Revision**: Article revisions with content and timestamps
- **Comment**: Comments on article revisions
- **Book**: Library books with metadata
- **Music**: Music files with metadata and binary content
- **Video**: Video files with metadata and binary content
- **Image**: Image files with metadata and binary content

### Relationships
- Articles have multiple revisions (one-to-many)
- Articles have one current revision (one-to-one)
- Revisions belong to one article (many-to-one)
- Revisions have multiple comments (one-to-many)
- Comments belong to one revision and one user (many-to-one)
- Music/Video/Image have content and metadata (one-to-one)

## Sample Data Features

### Articles
- Rich markdown content with headers, lists, and formatting
- Historical and cultural topics related to Africa
- Multiple revisions with different authors
- Comments from different users
- Proper timestamps and relationships

### Books
- Classic African and African-American literature
- Complete metadata including ISBN, genre, publication dates
- Realistic summaries and descriptions

### Media Files
- Sample music tracks from famous African artists
- Video files with descriptive names
- Image files with proper metadata
- Binary data placeholders (in real implementation, these would be actual files)

## Customization

You can easily customize the sample data by modifying the data arrays in the population scripts:

- `SAMPLE_USERS` - User accounts
- `SAMPLE_ARTICLES` - Article content and metadata
- `SAMPLE_BOOKS` - Book information
- `SAMPLE_MUSIC` - Music tracks and artists
- `SAMPLE_VIDEOS` - Video files
- `SAMPLE_IMAGES` - Image files

## Error Handling

The scripts include comprehensive error handling:

- Checks for existing data to avoid duplicates
- Graceful error handling with detailed error messages
- Rollback capabilities for failed operations
- Progress reporting during population

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**:
   - Verify your `.env` file has correct Supabase credentials
   - Check that your Supabase project is active
   - Ensure your Supabase tables are created

2. **Database Permission Error**:
   - Verify your database user has INSERT permissions
   - Check that all required tables exist

3. **Import Error**:
   - Ensure all dependencies are installed
   - Check that you're running from the correct directory

### Getting Help

If you encounter issues:

1. Check the error messages for specific details
2. Verify your database connection and credentials
3. Ensure all required tables exist in your database
4. Check that your Python environment has all required packages

## Development Notes

- The scripts are designed to be idempotent (safe to run multiple times)
- Existing data is detected and skipped to prevent duplicates
- All timestamps are set to realistic values
- Binary data is represented as placeholder strings for development

## Next Steps

After running the population scripts:

1. Start your backend server
2. Test the API endpoints with the sample data
3. Verify that the frontend can display the populated data
4. Add more sample data as needed for your development needs
