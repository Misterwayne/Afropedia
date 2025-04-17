#!/bin/bash

# Script to generate the initial file structure for the Next.js (Pages Router) frontend

echo "Creating directories..."

# Core directories
mkdir -p components lib context hooks pages public styles types

# Sub-directories for components
mkdir -p components/Auth components/Article components/UI

# Sub-directories for pages (matching routes)
mkdir -p pages/auth pages/wiki pages/edit pages/history

# Sub-directory in public
mkdir -p public/images

echo "Directories created."
echo "Creating files..."

# --- Components ---
touch components/Layout.tsx
touch components/Auth/LoginForm.tsx         # Renamed from AuthFormWrapper for clarity
touch components/Auth/RegisterForm.tsx      # Added matching form component
touch components/Article/ArticleViewer.tsx
touch components/Article/ArticleEditor.tsx
touch components/Article/RevisionList.tsx   # Renamed from RevisionItem for clarity

# UI Components (Examples)
touch components/UI/Spinner.tsx             # Renamed from LoadingSpinner
touch components/UI/ErrorMessage.tsx

# --- Context ---
touch context/AuthContext.tsx

# --- Hooks ---
touch hooks/useRequireAuth.ts
touch hooks/useDebounce.ts

# --- Lib / Utils ---
touch lib/api.ts
touch lib/articles.ts         # Optional API function grouping
touch lib/auth.ts             # Optional API function grouping
touch lib/helpers.ts          # General helpers

# --- Pages ---
# Note: `pages/_app.tsx` and `pages/index.tsx` are typically created by `create-next-app`.
# This script creates the *additional* pages needed for the wiki clone structure.
touch pages/auth/login.tsx
touch pages/auth/register.tsx
touch pages/wiki/[title].tsx       # Dynamic route for viewing articles
touch pages/edit/new.tsx           # Page for creating new articles
touch pages/edit/[title].tsx       # Dynamic route for editing articles
touch pages/history/[title].tsx    # Dynamic route for viewing history

# --- Styles ---
# Note: `styles/globals.css` is typically created by `create-next-app`.
touch styles/theme.ts              # For Chakra UI custom theme

# --- Types ---
touch types/index.ts               # Optional barrel file
touch types/article.ts
touch types/user.ts

# --- Environment File (create empty, user needs to fill it) ---
touch .env.local

echo "-------------------------------------"
echo "File structure generation complete."
echo "NOTE: This script does NOT create content, only empty files and folders."
echo "NOTE: Files like _app.tsx, index.tsx, globals.css created by 'create-next-app' are not touched."
echo "NOTE: Fill in your backend URL in '.env.local': NEXT_PUBLIC_API_URL=http://localhost:3001"
echo "-------------------------------------"

# End of script