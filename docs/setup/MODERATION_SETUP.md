# Moderation System Setup Guide

## Overview
The moderation and peer-review system has been implemented with the following features:

- **User Roles**: Admin, Moderator, Editor, User
- **Moderation Queue**: Track content awaiting review
- **Peer Review System**: Allow editors to review each other's work
- **Content Flagging**: Users can flag inappropriate content
- **Permission System**: Granular permission management
- **Moderation Actions**: Track all moderation decisions

## Database Setup

### Step 1: Create Moderation Tables

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the entire contents of `moderation_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the SQL

### Step 2: Verify Tables Created

Run this command to check if tables were created:

```bash
python setup_moderation_schema.py
```

## API Endpoints

The moderation system adds the following endpoints:

### Moderation Queue
- `POST /moderation/queue` - Create moderation queue item
- `GET /moderation/queue` - Get moderation queue items
- `PATCH /moderation/queue/{item_id}` - Update moderation queue item
- `POST /moderation/queue/{item_id}/assign` - Assign item to moderator

### Peer Reviews
- `POST /moderation/reviews` - Create peer review
- `GET /moderation/reviews/revision/{revision_id}` - Get reviews for revision
- `GET /moderation/reviews/reviewer/{reviewer_id}` - Get reviews by reviewer
- `PATCH /moderation/reviews/{review_id}` - Update peer review

### Content Flags
- `POST /moderation/flags` - Create content flag
- `GET /moderation/flags` - Get content flags
- `PATCH /moderation/flags/{flag_id}` - Update content flag

### Moderation Actions
- `POST /moderation/actions` - Create moderation action
- `GET /moderation/actions` - Get moderation actions

### User Permissions
- `POST /moderation/permissions` - Create user permission
- `GET /moderation/permissions/{user_id}` - Get user permissions

### Workflow Endpoints
- `POST /moderation/submit` - Submit content for moderation
- `POST /moderation/approve` - Approve content
- `POST /moderation/reject` - Reject content
- `POST /moderation/flag` - Flag content

### Dashboard
- `GET /moderation/dashboard/stats` - Get moderation statistics
- `GET /moderation/dashboard/recent-actions` - Get recent actions

## User Roles and Permissions

### Roles
- **Admin**: Full access to all moderation features
- **Moderator**: Can moderate content and manage flags
- **Editor**: Can review articles and create peer reviews
- **User**: Can flag content and submit for moderation

### Permissions
- `moderate_content` - Can moderate content
- `review_articles` - Can create peer reviews
- `manage_users` - Can manage user permissions

## Testing

After setting up the database, test the system:

```bash
python test_moderation.py
```

## Next Steps

1. **Set up the database schema** (run the SQL in Supabase)
2. **Test the API endpoints** using the test script
3. **Create frontend components** for the moderation interface
4. **Integrate with existing article workflow**

## Frontend Integration

The moderation system is ready for frontend integration. Key components needed:

1. **Moderation Dashboard** - Overview of pending items
2. **Review Interface** - For peer reviewers
3. **Flag Management** - For moderators
4. **Permission Management** - For admins
5. **Status Indicators** - Show content status throughout the app

## Database Schema

The moderation system adds these tables:

- `moderation_queue` - Items awaiting moderation
- `peer_review` - Peer review records
- `moderation_action` - All moderation actions taken
- `content_flag` - Content flags from users
- `user_permission` - User permission grants

Plus additional columns on existing tables:
- `user.role` - User role (admin, moderator, editor, user)
- `user.is_active` - Account status
- `user.reputation_score` - User reputation
- `article.status` - Content status (draft, pending, approved, rejected)
- `article.is_featured` - Featured content flag
- `revision.status` - Revision status
- `revision.is_approved` - Approval status
- `revision.needs_review` - Review requirement flag
