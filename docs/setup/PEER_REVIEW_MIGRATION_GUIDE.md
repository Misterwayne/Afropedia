# Peer Review Schema Migration Guide

## Problem
The `peer_review` table already exists with an old schema (basic columns like `score`, `feedback`) but the new peer review system needs advanced columns like `priority`, `reviewer_level`, etc.

## Solution
We need to migrate the existing table and create new tables. Since Supabase doesn't support complex migrations directly, we'll do this step by step.

## Step 1: Backup Existing Data (Optional but Recommended)
```sql
-- Create a backup of existing peer_review data
CREATE TABLE peer_review_backup AS SELECT * FROM peer_review;
```

## Step 2: Add Missing Columns to peer_review Table
Run this SQL in Supabase SQL Editor:

```sql
-- Add missing columns to peer_review table
ALTER TABLE peer_review 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS reviewer_level VARCHAR(20) NOT NULL DEFAULT 'junior',
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,2) CHECK (overall_score >= 1.0 AND overall_score <= 5.0),
ADD COLUMN IF NOT EXISTS criteria_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS strengths TEXT,
ADD COLUMN IF NOT EXISTS weaknesses TEXT,
ADD COLUMN IF NOT EXISTS suggestions TEXT,
ADD COLUMN IF NOT EXISTS detailed_feedback TEXT,
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
ADD COLUMN IF NOT EXISTS confidence_level INTEGER DEFAULT 3 CHECK (confidence_level >= 1 AND confidence_level <= 5),
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conflict_reason TEXT,
ADD COLUMN IF NOT EXISTS escalated_to INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
```

## Step 3: Migrate Existing Data
```sql
-- Migrate old 'score' column to 'overall_score' if it exists
UPDATE peer_review 
SET overall_score = score::DECIMAL(3,2) 
WHERE score IS NOT NULL AND overall_score IS NULL;

-- Migrate old 'feedback' column to 'detailed_feedback' if it exists
UPDATE peer_review 
SET detailed_feedback = feedback 
WHERE feedback IS NOT NULL AND detailed_feedback IS NULL;
```

## Step 4: Add Constraints
```sql
-- Add constraints
ALTER TABLE peer_review 
ADD CONSTRAINT IF NOT EXISTS peer_review_status_check 
CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'needs_changes', 'conflict', 'escalated'));

ALTER TABLE peer_review 
ADD CONSTRAINT IF NOT EXISTS peer_review_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical'));

ALTER TABLE peer_review 
ADD CONSTRAINT IF NOT EXISTS peer_review_reviewer_level_check 
CHECK (reviewer_level IN ('junior', 'senior', 'expert', 'mentor'));
```

## Step 5: Create New Tables
```sql
-- Create review_assignment table
CREATE TABLE IF NOT EXISTS review_assignment (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES peer_review(id) ON DELETE CASCADE,
    assigned_to INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'primary',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    due_date TIMESTAMP WITH TIME ZONE,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(review_id, assigned_to),
    CHECK (assignment_type IN ('primary', 'secondary', 'backup', 'escalation')),
    CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'overdue')),
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical'))
);

-- Create review_comment table
CREATE TABLE IF NOT EXISTS review_comment (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES peer_review(id) ON DELETE CASCADE,
    commenter_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES review_comment(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    comment_type VARCHAR(50) NOT NULL DEFAULT 'general',
    is_internal BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CHECK (comment_type IN ('general', 'question', 'suggestion', 'concern', 'praise', 'escalation'))
);

-- Create review_template table
CREATE TABLE IF NOT EXISTS review_template (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}',
    scoring_rubric JSONB NOT NULL DEFAULT '{}',
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(name),
    CHECK (category IN ('article', 'book', 'media', 'general', 'academic', 'technical'))
);
```

## Step 6: Create Indexes
```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_peer_review_status ON peer_review(status);
CREATE INDEX IF NOT EXISTS idx_peer_review_priority ON peer_review(priority);
CREATE INDEX IF NOT EXISTS idx_peer_review_reviewer ON peer_review(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_review_revision ON peer_review(revision_id);
CREATE INDEX IF NOT EXISTS idx_peer_review_created_at ON peer_review(created_at);
CREATE INDEX IF NOT EXISTS idx_peer_review_completed_at ON peer_review(completed_at);

CREATE INDEX IF NOT EXISTS idx_review_assignment_review ON review_assignment(review_id);
CREATE INDEX IF NOT EXISTS idx_review_assignment_assigned_to ON review_assignment(assigned_to);
CREATE INDEX IF NOT EXISTS idx_review_assignment_status ON review_assignment(status);
CREATE INDEX IF NOT EXISTS idx_review_comment_review ON review_comment(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comment_commenter ON review_comment(commenter_id);
CREATE INDEX IF NOT EXISTS idx_review_comment_parent ON review_comment(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_review_template_category ON review_template(category);
CREATE INDEX IF NOT EXISTS idx_review_template_active ON review_template(is_active);
```

## Step 7: Enable RLS and Create Policies
```sql
-- Enable Row Level Security (RLS) for new tables
ALTER TABLE review_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_template ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Enable all operations for authenticated users" ON review_assignment
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON review_comment
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON review_template
    FOR ALL USING (true);
```

## Step 8: Test the Migration
After applying all the SQL statements, test that everything works:

```python
# Run this Python script to test
python test_peer_review_migration.py
```

## Verification
After migration, you should be able to:
1. ✅ Access the peer review dashboard
2. ✅ Create new reviews with advanced features
3. ✅ Use the "New Review" button
4. ✅ View peer review analytics
5. ✅ Assign reviews to users
6. ✅ Add comments to reviews

## Troubleshooting
If you encounter errors:
1. **Column already exists**: Use `IF NOT EXISTS` in ALTER TABLE statements
2. **Constraint conflicts**: Drop existing constraints first
3. **Permission errors**: Make sure you're using the correct Supabase project

## Next Steps
After successful migration:
1. Test the peer review system in the frontend
2. Create some sample reviews
3. Test the review assignment workflow
4. Verify analytics are working
