// components/Search/EnhancedSearchInput.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  Text,
  useColorModeValue,
  Spinner,
  Card,
  CardBody,
  HStack,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { FiClock, FiTrendingUp } from 'react-icons/fi';
import apiClient from '@/lib/api';

// Keyframe animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

interface EnhancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface SearchSuggestion {
  text: string;
  type: 'suggestion' | 'recent' | 'trending';
}

const EnhancedSearchInput: React.FC<EnhancedSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search articles, books, topics...",
  size = 'lg'
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('african.200', 'gray.600');
  const suggestionHoverBg = useColorModeValue('african.50', 'gray.700');

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('afropedia_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('afropedia_recent_searches', JSON.stringify(updated));
  };

  // Fetch suggestions from backend
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      const backendSuggestions = (response.data || []).map((text: string) => ({
        text,
        type: 'suggestion' as const
      }));

      // Combine with recent searches that match
      const matchingRecent = recentSearches
        .filter(recent => recent.toLowerCase().includes(query.toLowerCase()) && recent !== query)
        .map(text => ({ text, type: 'recent' as const }));

      setSuggestions([...backendSuggestions, ...matchingRecent].slice(0, 8));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to recent searches
      const matchingRecent = recentSearches
        .filter(recent => recent.toLowerCase().includes(query.toLowerCase()))
        .map(text => ({ text, type: 'recent' as const }));
      setSuggestions(matchingRecent.slice(0, 5));
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value && showSuggestions) {
        fetchSuggestions(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true);
    if (!value) {
      // Show recent searches and trending topics when focused with empty input
      const recentSuggestions = recentSearches.map(text => ({ text, type: 'recent' as const }));
      const trendingTopics = [
        'Ancient Egypt',
        'African Kingdoms',
        'Traditional Music',
        'African Languages'
      ].map(text => ({ text, type: 'trending' as const }));
      
      setSuggestions([...recentSuggestions, ...trendingTopics].slice(0, 8));
    } else {
      fetchSuggestions(value);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    saveRecentSearch(suggestion.text);
    onSearch(suggestion.text);
  };

  // Handle search
  const handleSearch = () => {
    if (value.trim()) {
      saveRecentSearch(value);
      onSearch(value);
      setShowSuggestions(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <FiClock size="14px" />;
      case 'trending':
        return <FiTrendingUp size="14px" />;
      default:
        return <SearchIcon boxSize="14px" />;
    }
  };

  const getSuggestionBadge = (type: string) => {
    switch (type) {
      case 'recent':
        return <Badge size="sm" colorScheme="gray">Recent</Badge>;
      case 'trending':
        return <Badge size="sm" colorScheme="orange">Trending</Badge>;
      default:
        return null;
    }
  };

  return (
    <Box position="relative" w="full">
      {/* Advanced Search Container */}
      <Box
        position="relative"
        w="full"
        h="100px"
        bg="linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"
        borderRadius="50px"
        border="2px solid"
        borderColor="whiteAlpha.300"
        backdropFilter="blur(30px)"
        shadow="0 25px 50px rgba(0,0,0,0.25)"
        _hover={{
          borderColor: 'whiteAlpha.500',
          shadow: '0 35px 70px rgba(0,0,0,0.35)',
          transform: 'translateY(-2px)'
        }}
        _focusWithin={{
          borderColor: 'yellow.300',
          boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.2), 0 35px 70px rgba(0,0,0,0.35)',
          transform: 'translateY(-2px)'
        }}
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        overflow="hidden"
      >
        {/* Animated Background Gradient */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="linear-gradient(45deg, rgba(251,191,36,0.1) 0%, rgba(255,255,255,0.1) 50%, rgba(251,191,36,0.1) 100%)"
          backgroundSize="200% 200%"
          animation="gradientShift 3s ease infinite"
          opacity="0.6"
        />
        
        {/* Search Input */}
        <InputGroup h="100px" size="lg">
          <InputLeftElement h="100px" pl="8" w="auto">
            <Box
              display="flex"
              alignItems="center"
              gap="3"
            >
              <SearchIcon 
                color="whiteAlpha.700" 
                boxSize="6" 
                transition="all 0.3s"
                _groupFocus={{ color: 'yellow.300', transform: 'scale(1.1)' }}
              />
              <Box
                h="6"
                w="1px"
                bg="whiteAlpha.400"
                _groupFocus={{ bg: 'yellow.300' }}
                transition="all 0.3s"
              />
            </Box>
          </InputLeftElement>
          
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            bg="transparent"
            border="none"
            h="100px"
            fontSize="xl"
            fontWeight="500"
            color="black"
            _placeholder={{ 
              color: 'blackAlpha.700',
              fontWeight: '400',
              transition: 'all 0.3s'
            }}
            _focus={{
              _placeholder: { color: 'blackAlpha.500' },
              boxShadow: 'none',
              border: 'none'
            }}
            _hover={{
              _placeholder: { color: 'blackAlpha.600' }
            }}
            pl="20"
            pr="32"
            borderBottomRadius={showSuggestions && suggestions.length > 0 ? '0' : '50px'}
          />
          
          <InputRightElement h="100px" pr="4" w="auto">
            <HStack spacing="3">
              {/* Search Suggestions Indicator */}
              <Box
                display="flex"
                alignItems="center"
                gap="1"
                opacity="0.7"
                _groupFocus={{ opacity: '1' }}
                transition="opacity 0.3s"
              >
                <Box
                  w="2"
                  h="2"
                  bg="yellow.300"
                  borderRadius="full"
                  animation="pulse 2s infinite"
                />
                <Text
                  fontSize="sm"
                  color="blackAlpha.600"
                  fontWeight="500"
                  _groupFocus={{ color: 'yellow.200' }}
                  transition="color 0.3s"
                >
                  AI Powered
                </Text>
              </Box>
              
              {/* Search Button */}
              <IconButton
                aria-label="Search"
                icon={<SearchIcon />}
                onClick={handleSearch}
                bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                color="black"
                _hover={{ 
                  bg: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  transform: 'scale(1.05)',
                  shadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
                }}
                _active={{
                  transform: 'scale(0.95)'
                }}
                size="lg"
                borderRadius="full"
                shadow="0 8px 20px rgba(245, 158, 11, 0.3)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                w="60px"
                h="60px"
              />
            </HStack>
          </InputRightElement>
        </InputGroup>
        
        {/* Floating Search Tips */}
        <Box
          position="absolute"
          bottom="-40px"
          left="50%"
          transform="translateX(-50%)"
          display="flex"
          gap="4"
          opacity="0.8"
          _groupFocus={{ opacity: '1' }}
          transition="opacity 0.3s"
        >
          <Text fontSize="sm" color="blackAlpha.600">
            Try: "Ancient Timbuktu" • "Nubian Kingdoms" • "African Art"
          </Text>
        </Box>
      </Box>

      {/* Enhanced Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <Card
          ref={suggestionsRef}
          position="absolute"
          top="120px"
          left="0"
          right="0"
          zIndex={1000}
          bg="rgba(255,255,255,0.95)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="20px"
          shadow="0 20px 40px rgba(0,0,0,0.1)"
          maxH="300px"
          overflowY="auto"
        >
          <CardBody p={0}>
            {isLoadingSuggestions ? (
              <Flex justify="center" align="center" p={4}>
                <Spinner size="sm" color="african.500" />
                <Text ml={2} fontSize="sm" color="gray.600">
                  Finding suggestions...
                </Text>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch">
                {suggestions.map((suggestion, index) => (
                  <Box
                    key={index}
                    px={4}
                    py={3}
                    cursor="pointer"
                    _hover={{ bg: suggestionHoverBg }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    borderBottom={index < suggestions.length - 1 ? "1px solid" : "none"}
                    borderBottomColor="gray.100"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Box color="african.500">
                          {getSuggestionIcon(suggestion.type)}
                        </Box>
                        <Text fontSize="sm" color="gray.800">
                          {suggestion.text}
                        </Text>
                      </HStack>
                      {getSuggestionBadge(suggestion.type)}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default EnhancedSearchInput;
