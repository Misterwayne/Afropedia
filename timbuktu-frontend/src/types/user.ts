// types/user.ts
export interface User {
    id: number;
    username: string;
    email: string;
    role?: string; // User role for moderation
    is_active?: boolean; // Account status
    reputation_score?: number; // User reputation
    createdAt: string; // Consider using Date type if you parse it
    updatedAt: string;
  }
  
  export interface LoginResponse {
      access_token: string;
      user: Omit<User, 'password'>; // Password should not be in response
  }