# Peer Review System Setup Guide

## Overview

The Afropedia Peer Review System is a state-of-the-art, comprehensive peer review platform designed for collaborative content review and quality assurance. It features advanced scoring systems, detailed analytics, template-based reviews, and sophisticated workflow management.

## Features

### 🎯 Core Features
- **Advanced Scoring System**: Multi-criteria scoring with weighted categories
- **Review Templates**: Pre-configured templates for different content types
- **Assignment Management**: Automated and manual review assignment system
- **Real-time Analytics**: Comprehensive metrics and performance tracking
- **Comment System**: Collaborative discussion and feedback
- **Workflow Management**: Status tracking and escalation procedures
- **Quality Metrics**: Detailed quality assessment and reporting

### 🚀 Advanced Features
- **Consensus Analysis**: Automatic calculation of review consensus
- **Reviewer Profiles**: Detailed reviewer performance metrics
- **Template System**: Customizable review templates
- **Priority Management**: Multi-level priority system
- **Time Tracking**: Review duration and efficiency metrics
- **Conflict Resolution**: Built-in conflict resolution mechanisms
- **Escalation System**: Automatic escalation for complex reviews

## Database Schema

### Tables Created

1. **peer_review**: Main review table with advanced scoring
2. **review_assignment**: Review assignment management
3. **review_comment**: Comments and discussions
4. **review_template**: Review templates and guidelines

### Key Features of Schema

- **JSONB Support**: Flexible criteria scoring and metadata
- **Comprehensive Indexing**: Optimized for performance
- **Row Level Security**: Secure data access
- **Triggers**: Automatic timestamp updates
- **Functions**: Built-in analytics and consensus calculation
- **Views**: Pre-computed statistics and rankings

## Setup Instructions

### Prerequisites

1. Supabase project set up and running
2. Database schema applied (see `setup_schema.sql`)
3. Moderation system set up (see `moderation_schema.sql`)

### Step 1: Apply Database Schema

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `peer_review_schema.sql`
4. Execute the SQL script
5. Verify tables are created

### Step 2: Test the System

```bash
# Run the test script
python test_peer_review.py

# Check if all tests pass
```

### Step 3: Configure Review Templates

The system comes with default templates:
- Standard Article Review
- Technical Content Review
- Historical Content Review
- Quick Review

You can create custom templates via the API or directly in the database.

## API Endpoints

### Core Review Endpoints

- `POST /peer-review/reviews` - Create new review
- `GET /peer-review/reviews/{id}` - Get specific review
- `PATCH /peer-review/reviews/{id}` - Update review
- `POST /peer-review/reviews/{id}/start` - Start review
- `POST /peer-review/reviews/{id}/complete` - Complete review

### Assignment Management

- `POST /peer-review/assignments` - Create assignment
- `GET /peer-review/assignments/pending` - Get pending assignments
- `POST /peer-review/assignments/{id}/accept` - Accept assignment
- `POST /peer-review/assignments/{id}/decline` - Decline assignment

### Analytics and Metrics

- `GET /peer-review/analytics` - Get system analytics
- `GET /peer-review/metrics/reviewer/{id}` - Get reviewer metrics
- `GET /peer-review/consensus/{revision_id}` - Get review consensus

### Templates and Comments

- `GET /peer-review/templates` - Get review templates
- `POST /peer-review/templates` - Create template
- `POST /peer-review/comments` - Create comment
- `GET /peer-review/comments/{review_id}` - Get review comments

## Frontend Components

### Main Components

1. **PeerReviewDashboard**: Main dashboard with metrics and assignments
2. **AdvancedPeerReviewInterface**: Detailed review interface
3. **PeerReviewAnalytics**: Comprehensive analytics and reporting

### Pages

- `/peer-review` - Main dashboard
- `/peer-review/[reviewId]` - Individual review interface
- `/peer-review/analytics` - Analytics dashboard

## Usage Examples

### Creating a Review

```python
from peer_review_models import PeerReviewCreate, ReviewStatus, ReviewPriority

review_data = PeerReviewCreate(
    revision_id=123,
    reviewer_id=456,
    status=ReviewStatus.PENDING,
    priority=ReviewPriority.HIGH,
    criteria_scores={
        "accuracy": 4,
        "clarity": 3,
        "completeness": 4,
        "sources": 3,
        "neutrality": 4,
        "style": 3,
        "technical": 4,
        "factual": 4
    }
)

review = await create_peer_review(review_data)
```

### Assigning Multiple Reviewers

```python
from crud.peer_review_crud import assign_reviewers_to_revision

assignments = await assign_reviewers_to_revision(
    revision_id=123,
    reviewer_ids=[456, 789, 101],
    priority=ReviewPriority.NORMAL,
    instructions="Please review for accuracy and clarity"
)
```

### Getting Review Consensus

```python
from crud.peer_review_crud import get_review_consensus

consensus = await get_review_consensus(revision_id=123)
print(f"Consensus: {consensus['consensus']}")
print(f"Confidence: {consensus['confidence']}")
```

## Configuration

### Review Criteria

The system supports 8 standard criteria:
- **Accuracy**: Factual correctness
- **Clarity**: Readability and structure
- **Completeness**: Information coverage
- **Sources**: Reference quality
- **Neutrality**: Balanced perspective
- **Style**: Writing quality
- **Technical**: Technical accuracy
- **Factual**: Fact verification

### Priority Levels

- **Low**: Non-urgent reviews
- **Normal**: Standard priority
- **High**: Important content
- **Urgent**: Time-sensitive
- **Critical**: Must-review content

### Reviewer Levels

- **Junior**: New reviewers
- **Senior**: Experienced reviewers
- **Expert**: Subject matter experts
- **Mentor**: Senior mentors

## Monitoring and Analytics

### Key Metrics

- Total reviews completed
- Average review scores
- Completion rates
- Review duration
- Reviewer performance
- Quality trends

### Dashboard Features

- Real-time metrics
- Performance charts
- Reviewer rankings
- Quality analysis
- Trend visualization

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure Supabase is properly configured
2. **Permission Errors**: Check user roles and permissions
3. **Template Issues**: Verify template JSON format
4. **Score Calculation**: Check criteria_scores format

### Debug Mode

Enable debug logging in the backend to see detailed error messages:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Security Considerations

- All endpoints require authentication
- Role-based access control implemented
- Row-level security enabled
- Input validation on all endpoints
- SQL injection protection

## Performance Optimization

- Database indexes on key columns
- Efficient queries with proper joins
- Caching for frequently accessed data
- Pagination for large result sets
- Background processing for heavy operations

## Future Enhancements

- Machine learning-based quality scoring
- Automated review suggestions
- Integration with external review tools
- Advanced reporting and dashboards
- Mobile app support
- Real-time notifications

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the database logs
4. Contact the development team

## License

This peer review system is part of the Afropedia project and follows the same licensing terms.
