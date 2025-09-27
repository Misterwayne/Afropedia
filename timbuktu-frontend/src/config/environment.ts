// Environment configuration for Afropedia Frontend
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://afropediabackend-production.up.railway.app',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // App Configuration
  appName: 'Afropedia',
  appVersion: '1.0.0',
  
  // Features
  features: {
    enableSearch: true,
    enableComments: true,
    enablePeerReview: true,
    enableModeration: true,
    enableMediaUpload: true,
  },
  
  // API Endpoints
  endpoints: {
    articles: '/articles',
    books: '/books',
    search: '/search/results',
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      profile: '/auth/profile',
    },
    moderation: {
      queue: '/moderation/queue',
      reviews: '/moderation/reviews',
    },
    peerReview: {
      reviews: '/peer-review/reviews',
      assignments: '/peer-review/assignments',
    },
  },
} as const;

export default config;
