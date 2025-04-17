// pages/_app.tsx
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext'; // Adjust path if using src/
import Layout from '../components/Layout';           // Adjust path if using src/
// Optional: Import custom theme
// import theme from '../styles/theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // 1. ChakraProvider for UI components
    <ChakraProvider /* theme={theme} */>
      {/* 2. AuthProvider for authentication state */}
      <AuthProvider>
        {/* 3. Layout for navigation and structure */}
        <Layout>
           {/* 4. The actual page component */}
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;