# Peer Review System - Quick Start Guide

## 🚀 Quick Setup

### 1. Apply Database Schema
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `peer_review_schema.sql`
4. Click "Run" to execute

### 2. Start the Backend
```bash
cd wikipedia-clone-py-backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend
```bash
cd timbuktu-frontend
npm run dev
```

### 4. Access the System
- Go to `http://localhost:3000/peer-review`
- Make sure you're logged in first
- The system will show appropriate messages if not authenticated

## 🔧 Troubleshooting

### Common Issues:

#### 1. 403 Forbidden Errors
- **Cause**: User not authenticated or missing user ID
- **Fix**: Make sure you're logged in and have a valid user ID

#### 2. "Could not find the table" Errors
- **Cause**: Database schema not applied
- **Fix**: Run the `peer_review_schema.sql` in Supabase

#### 3. Null User ID Errors
- **Cause**: Frontend not getting user ID from localStorage
- **Fix**: Check authentication flow and ensure user ID is stored

### Error Handling:
The system now includes graceful error handling:
- Invalid user IDs return empty data instead of errors
- Missing tables return empty arrays
- Authentication issues show user-friendly messages

## 📊 Features Available

### For All Users:
- View peer review dashboard
- See authentication status
- Access basic interface

### For Reviewers (when database is set up):
- View pending assignments
- Create and manage reviews
- Track performance metrics
- Use review templates

### For Admins:
- Manage review assignments
- View system analytics
- Configure review templates
- Monitor reviewer performance

## 🎯 Next Steps

1. **Apply the database schema** to enable full functionality
2. **Create some test data** using the test scripts
3. **Assign user roles** (editor, moderator, admin) for full access
4. **Test the review workflow** with sample content

## 📝 Notes

- The system works without the database schema but with limited functionality
- All API endpoints include proper error handling
- Frontend shows appropriate messages for different states
- Authentication is required for all peer review features
