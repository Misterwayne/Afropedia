ALTER TABLE revision 
ALTER COLUMN comments TYPE text[] USING ARRAY[comments],
ALTER COLUMN comments SET DEFAULT '{}';

-- Update existing rows to have empty array if null
UPDATE revision 
SET comments = '{}' 
WHERE comments IS NULL;