// lib/api.ts
import axios from 'axios';
import config from '../config/environment';

// Define the base URL of your backend
// Use /api proxy in development, direct URL in production
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api' 
  : config.apiUrl;

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor to add JWT token to requests ---
apiClient.interceptors.request.use(
  (config) => {
    // Check if running on client-side (where localStorage is available)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken'); // We'll store the token here after login
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Optional: Interceptor for response error handling (e.g., 401 redirects) ---
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized access - e.g., redirect to login
//       console.error("Unauthorized access - redirecting to login.");
//       localStorage.removeItem('authToken');
//       // Use Next.js router to redirect (ensure this runs client-side)
//       if (typeof window !== 'undefined') {
//          window.location.href = '/auth/login'; // Simple redirect
//       }
//     }
//     return Promise.reject(error);
//   }
// );


export default apiClient;