// hooks/useRequireAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

/**
 * Hook to protect routes client-side. Redirects to login if user is not authenticated
 * after the initial auth check is complete.
 * @param redirectTo The path to redirect to if not authenticated (default: '/auth/login').
 */
export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, isAuthCheckComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if the initial authentication check is complete AND the user is not authenticated.
    if (isAuthCheckComplete && !isAuthenticated()) {
      console.log('useRequireAuth: Not authenticated, redirecting...');
      // Pass the current path as a query parameter to redirect back after login
      router.push(`${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`);
    }
    // If auth check isn't complete yet, or user IS authenticated, do nothing.
  }, [isAuthenticated, isAuthCheckComplete, router, redirectTo]);

  // Return the authentication status (optional, might be useful for conditional rendering)
  // and the completion status to avoid rendering protected content prematurely.
  return { isAuthenticated: isAuthenticated(), isAuthCheckComplete };
}