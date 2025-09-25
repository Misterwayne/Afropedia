# Afropedia Database Setup Guide

The error you encountered indicates that the database tables don't exist yet in your Supabase database. This guide will help you set up the database schema and then populate it with sample data.

## Quick Fix

**Step 1: Check what tables exist**
```bash
python check_tables.py
```

**Step 2: Create the database schema**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to the **SQL Editor** tab
4. Copy the entire contents of `setup_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the SQL

**Step 3: Verify tables were created**
```bash
python check_tables.py
```

**Step 4: Populate with sample data**
```bash
python populate_supabase.py
```

## Detailed Instructions

### Option 1: Manual Setup (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema SQL**
   - Open the file `setup_schema.sql` in your project
   - Copy the entire contents
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Check that all tables were created

### Option 2: Automatic Setup (May not work)

Try running the automatic setup script:
```bash
python setup_schema.py
```

If this fails, use Option 1 instead.

### What the Schema Creates

The `setup_schema.sql` file creates:

- **Core Tables:**
  - `user` - User accounts and authentication
  - `article` - Wiki articles
  - `revision` - Article revisions with content
  - `comment` - Comments on revisions

- **Media Tables:**
  - `book` - Library books
  - `music_content` & `music_metadata` - Music files
  - `video_content` & `videos` - Video files
  - `image_content` & `image_metadata` - Image files

- **Features:**
  - Proper foreign key relationships
  - Indexes for performance
  - Full-text search support
  - Row Level Security (RLS)
  - Automatic timestamp updates

## Troubleshooting

### Common Issues

1. **"Could not find table" errors**
   - **Cause:** Tables don't exist in Supabase
   - **Solution:** Run the schema setup first

2. **Permission errors**
   - **Cause:** RLS policies or API key issues
   - **Solution:** Check your Supabase API key and RLS policies

3. **Foreign key constraint errors**
   - **Cause:** Tables created in wrong order
   - **Solution:** Drop all tables and recreate using the full schema

### Verification Steps

1. **Check tables exist:**
   ```bash
   python check_tables.py
   ```

2. **Test connection:**
   ```bash
   python test_population.py
   ```

3. **Verify in Supabase Dashboard:**
   - Go to "Table Editor"
   - You should see all the tables listed

## Next Steps

After successfully setting up the schema:

1. **Populate with sample data:**
   ```bash
   python populate_supabase.py
   ```

2. **Start your backend:**
   ```bash
   python -m uvicorn main:app --reload
   ```

3. **Test the API endpoints:**
   - Visit `http://localhost:8000/docs` for the API documentation
   - Test the `/articles/` endpoint to see populated data

## Files Created

- `setup_schema.sql` - Complete database schema
- `setup_schema.py` - Automatic schema setup script
- `check_tables.py` - Verify tables exist
- `populate_supabase.py` - Populate with sample data
- `test_population.py` - Test the setup

## Need Help?

If you're still having issues:

1. Check the Supabase logs in your dashboard
2. Verify your `.env` file has correct credentials
3. Make sure your Supabase project is active
4. Try creating tables one by one if the full schema fails

The manual setup (Option 1) is the most reliable method and should work in all cases.
