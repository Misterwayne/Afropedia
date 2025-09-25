// types/standard.ts
// Standardized types for consistent data handling

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  is_active: boolean;
  reputation_score: number;
}

export interface Article extends BaseEntity {
  title: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  view_count: number;
  current_revision_id: number | null;
  current_revision?: Revision;
  revisions?: Revision[];
}

export interface Revision extends BaseEntity {
  content: string;
  comment: string | null;
  timestamp: string;
  article_id: number;
  user_id: number | null;
  user: User | null;
  status: 'pending' | 'approved' | 'rejected';
  is_approved: boolean;
  needs_review: boolean;
  comments: Comment[];
}

export interface Comment extends BaseEntity {
  content: string;
  user_id: number | null;
  revision_id: number;
  user: Pick<User, 'id' | 'username'> | null;
}

export interface Book extends BaseEntity {
  title: string;
  author: string;
  publication_date: string | null;
  description: string | null;
  cover_image: string | null;
  isbn: string | null;
  genre: string | null;
}

// Standard API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  version: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
  version: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message?: string;
  timestamp: string;
  version: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: {
    articles: {
      hits: any[];
      totalHits: number;
      processingTimeMs: number;
    };
    books: {
      hits: any[];
      totalHits: number;
      processingTimeMs: number;
    };
  };
  total_results: number;
  processing_time_ms: number;
  filters?: Record<string, any>;
  suggestions?: string[];
  timestamp: string;
  version: string;
}

// Type Guards for Runtime Type Checking
export function isUser(obj: any): obj is User {
  return obj && 
    typeof obj.id === 'number' && 
    typeof obj.username === 'string' && 
    typeof obj.email === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.is_active === 'boolean';
}

export function isArticle(obj: any): obj is Article {
  return obj && 
    typeof obj.id === 'number' && 
    typeof obj.title === 'string' && 
    typeof obj.status === 'string' &&
    typeof obj.is_featured === 'boolean';
}

export function isRevision(obj: any): obj is Revision {
  return obj && 
    typeof obj.id === 'number' && 
    typeof obj.content === 'string' && 
    typeof obj.article_id === 'number' &&
    typeof obj.status === 'string' &&
    typeof obj.is_approved === 'boolean';
}

export function isComment(obj: any): obj is Comment {
  return obj && 
    typeof obj.id === 'number' && 
    typeof obj.content === 'string' && 
    typeof obj.revision_id === 'number';
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && 
    typeof obj.success === 'boolean' && 
    obj.data !== undefined &&
    typeof obj.timestamp === 'string' &&
    typeof obj.version === 'string';
}

export function isApiError(obj: any): obj is ApiError {
  return obj && 
    obj.success === false && 
    typeof obj.error === 'string' && 
    typeof obj.code === 'string' &&
    typeof obj.timestamp === 'string';
}
