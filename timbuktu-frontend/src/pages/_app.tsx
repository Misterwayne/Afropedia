// pages/_app.tsx
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import AfropediaLayout from '../components/AfropediaLayout';
import theme from '../styles/afropedia-theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Afropedia - The African Encyclopedia</title>
        <meta name="description" content="Afropedia is the premier African encyclopedia with academic peer review, celebrating African knowledge and culture." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      {/* 1. ChakraProvider with African theme */}
      <ChakraProvider theme={theme}>
        {/* 2. AuthProvider for authentication state */}
        <AuthProvider>
          {/* 3. AfropediaLayout for navigation and structure */}
          <AfropediaLayout>
             {/* 4. The actual page component */}
            <Component {...pageProps} />
          </AfropediaLayout>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;