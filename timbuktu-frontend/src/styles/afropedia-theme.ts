import { extendTheme } from '@chakra-ui/react';

// African-inspired color palette
const colors = {
  // Warm earth tones reminiscent of African landscapes
  african: {
    50: '#fefcf7',   // Very light cream with better contrast
    100: '#fdecd1',  // Cream
    200: '#fbd4a3',  // Light gold
    300: '#f8b875',  // Golden yellow
    400: '#f59e47',  // Orange gold
    500: '#f28519',  // Primary orange
    600: '#d96d0f',  // Dark orange
    700: '#b8550b',  // Burnt orange
    800: '#973d07',  // Deep orange
    900: '#762503',  // Dark brown
  },
  // Rich reds like African sunsets
  sunset: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Primary red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Deep greens like African forests
  forest: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Primary green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Warm browns like African soil
  earth: {
    50: '#fdf8f6',
    100: '#f2e8e5',
    200: '#eaddd7',
    300: '#e0cec7',
    400: '#d2bab0',
    500: '#bfa094',  // Primary brown
    600: '#a18072',
    700: '#977669',
    800: '#846358',
    900: '#43302b',
  },
  // Deep blues like African skies
  sky: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Primary blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  }
};

// Custom fonts
const fonts = {
  heading: '"Inter", "Segoe UI", system-ui, sans-serif',
  body: '"Inter", "Segoe UI", system-ui, sans-serif',
  mono: '"Fira Code", "Monaco", "Consolas", monospace',
};

// Custom components
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
      _focus: {
        boxShadow: '0 0 0 3px rgba(242, 133, 25, 0.3)',
      },
    },
    variants: {
      solid: {
        bg: 'african.500',
        color: 'white',
        _hover: {
          bg: 'african.600',
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          bg: 'african.700',
          transform: 'translateY(0)',
        },
      },
      outline: {
        borderColor: 'african.500',
        color: 'african.500',
        _hover: {
          bg: 'african.50',
          borderColor: 'african.600',
        },
      },
      ghost: {
        color: 'african.500',
        _hover: {
          bg: 'african.50',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'xl',
        boxShadow: '0 4px 6px -1px rgba(242, 133, 25, 0.1), 0 2px 4px -1px rgba(242, 133, 25, 0.06)',
        border: '1px solid',
        borderColor: 'african.100',
        _hover: {
          boxShadow: '0 10px 15px -3px rgba(242, 133, 25, 0.15), 0 4px 6px -2px rgba(242, 133, 25, 0.08)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
      color: 'african.900', // Darker for better contrast
    },
  },
  Link: {
    baseStyle: {
      color: 'african.500',
      _hover: {
        color: 'african.600',
        textDecoration: 'underline',
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'gray.50',
          border: '2px solid',
          borderColor: 'transparent',
          _hover: {
            bg: 'gray.100',
          },
          _focus: {
            bg: 'white',
            borderColor: 'african.500',
            boxShadow: '0 0 0 1px rgba(242, 133, 25, 0.3)',
          },
        },
      },
    },
  },
  Textarea: {
    variants: {
      filled: {
        bg: 'gray.50',
        border: '2px solid',
        borderColor: 'transparent',
        _hover: {
          bg: 'gray.100',
        },
        _focus: {
          bg: 'white',
          borderColor: 'african.500',
          boxShadow: '0 0 0 1px rgba(242, 133, 25, 0.3)',
        },
      },
    },
  },
};

// Custom theme
const theme = extendTheme({
  colors,
  fonts,
  components,
  styles: {
    global: {
      body: {
        bg: 'african.50', // Warm African sand color instead of gray
        color: 'gray.900', // Darker text for better contrast
      },
      // Ensure headings are dark enough
      'h1, h2, h3, h4, h5, h6': {
        color: 'african.900 !important',
      },
      // Ensure paragraph text is readable
      p: {
        color: 'gray.800 !important',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
