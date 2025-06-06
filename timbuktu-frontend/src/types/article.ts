// types/article.ts
import { User } from './user';

export interface Comment {
    id: number;
    content: string;
    user_id: number | null;
    created_at: string; // Consider using Date type
}

export interface Revision {
    id: number;
    content: string;
    comments: [Comment] | null;
    timestamp: string; // Consider using Date type
    articleId: number;
    userId: number | null;
    user?: Pick<User, 'id' | 'username'> | null; // User who made the revision (optional include)
}

export interface Article {
    id: number;
    title: string; // Normalized title
    createdAt: string; // Consider using Date type
    updatedAt: string; // Consider using Date type
    currentRevisionId: number | null;
    currentRevision?: Revision; // Optional include
    revisions?: Revision[]; // Optional include
}

// Type for the article list endpoint (less data)
export interface ArticleSummary {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}