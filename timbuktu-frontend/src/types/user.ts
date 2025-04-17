// types/user.ts
export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string; // Consider using Date type if you parse it
    updatedAt: string;
  }
  
  export interface LoginResponse {
      access_token: string;
      user: Omit<User, 'password'>; // Password should not be in response
  }