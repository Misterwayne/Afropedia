// components/Music/AudioPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Image, Text, Heading, Slider, SliderTrack, SliderFilledTrack, SliderThumb, IconButton, Icon, Spinner, Center, Tooltip, Skeleton, useToast // Import useToast for error feedback
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaDownload } from 'react-icons/fa';
import apiClient from '@/lib/api'; // Adjust path if needed

/**
 * Frontend representation of the Music Metadata.
 * Should match the structure returned by your `/music/{music_id}` endpoint.
 */
interface MusicMetadataSchemaFE {
    id: number;
    title: string;
    artist: string;
    album: string;
    // Add cover_image_url if your backend provides it directly
    // cover_image_url?: string | null;
    // OR expect cover_image as potentially part of this fetch if needed
    // cover_image?: Blob | null; // Example if blob was returned
}

/**
 * Props for the AudioPlayer component.
 */
interface AudioPlayerProps {
  /** The unique ID of the music track to load and play. */
  musicId: number;
}

/**
 * An embeddable audio player component that fetches its own metadata
 * and displays playback controls.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ musicId }) => {
  const audioRef = useRef<HTMLAudioElement>(null); // Ref to the underlying HTML audio element
  const toast = useToast(); // For showing errors

  // State variables
  const [metadata, setMetadata] = useState<MusicMetadataSchemaFE | null>(null); // Store fetched track info
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null); // URL for cover art (Blob URL or direct URL)
  const [streamUrl, setStreamUrl] = useState<string>(''); // URL for the audio stream
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // Volume level (0.0 to 1.0)
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Combined loading state for metadata & audio readiness
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  // --- Effect to fetch metadata and set up URLs ---
  useEffect(() => {
    console.log(`[AudioPlayer] Mounting/ID change for ID: ${musicId}`);
    setIsLoading(true);
    setError(null);
    setMetadata(null);
    setCoverArtUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (isNaN(musicId) || musicId <= 0) {
        setError("Invalid Music ID provided.");
        setIsLoading(false);
        return;
    }

    // Construct stream URL immediately
    const constructedStreamUrl = `${API_BASE_URL}/music/stream/${musicId}`;
    setStreamUrl(constructedStreamUrl);
    console.log(`[AudioPlayer] Stream URL set to: ${constructedStreamUrl}`);

    // Fetch metadata from the backend API
    apiClient.get<MusicMetadataSchemaFE>(`/music/${musicId}`)
      .then(response => {
        console.log(`[AudioPlayer] Metadata received for ID ${musicId}:`, response.data);
        setMetadata(response.data);
        // Reset error state on successful fetch
        setError(null);
        // Note: Metadata is loaded, but audio duration isn't known yet.
        // isLoading will be set to false in handleLoadedMetadata.

        // --- Optional: Fetch or process cover art ---
        // If your metadata API endpoint ALSO returns the cover image data (e.g., as base64 or blob):
        // processCoverData(response.data.cover_image); // Example function call
        // OR If you need a separate endpoint for the cover:
        // fetchCoverArt(musicId);
      })
      .catch(err => {
        console.error(`[AudioPlayer] Failed to fetch metadata for music ID ${musicId}:`, err);
        const errorMsg = err.response?.data?.detail || `Could not load track info (ID: ${musicId})`;
        setError(errorMsg);
        toast({ // Inform user
            title: "Error Loading Track",
            description: errorMsg,
            status: "error",
            duration: 5000,
            isClosable: true,
        })
        setIsLoading(false); // Stop loading if metadata fetch fails
      });

  }, [musicId, API_BASE_URL, toast]); // Re-run effect if musicId changes


  // --- Placeholder for cover art fetching/processing ---
  // Replace this with your actual logic if you implement cover art handling
  const fetchCoverArt = async (id: number) => {
      try {
          // Example: Fetching blob from /music/{id}/cover
          // const response = await apiClient.get(`/music/${id}/cover`, { responseType: 'blob' });
          // if (response.data && response.data.size > 0) {
          //    const url = URL.createObjectURL(response.data);
          //    setCoverArtUrl(url);
          //    // Remember to revoke URL on unmount if using createObjectURL
          // } else {
          //    setCoverArtUrl(null);
          // }
          setCoverArtUrl(null); // Default no cover
      } catch (error) {
          console.error("Cover art fetch failed:", error);
          setCoverArtUrl(null);
      }
  };
   // --- End Placeholder ---


  // --- Audio Element Event Handlers ---
  // Called when the browser has loaded metadata (duration, dimensions etc.)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (!isNaN(audioDuration) && isFinite(audioDuration)) {
          console.log(`[AudioPlayer] Metadata loaded, duration: ${audioDuration}`);
          setDuration(audioDuration);
          setIsLoading(false); // *** Set loading to false HERE ***
      } else {
           console.warn(`[AudioPlayer] Received invalid duration: ${audioDuration}`);
           // Keep loading true or set an error state if duration is crucial and invalid
           // setError("Could not determine audio duration.");
           // setIsLoading(false); // Or maybe stop loading anyway
      }
    }
  };

   // Called when enough data is available to start playing
   const handleCanPlay = () => {
       console.log("[AudioPlayer] Audio can play.");
       // Potentially set isLoading to false here if you want controls enabled earlier,
       // but handleLoadedMetadata is usually better as it gives duration.
       // setIsLoading(false);
   };


  // Called frequently as the audio plays
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Called when the Play/Pause button is clicked
  const handlePlayPause = () => {
    if (!audioRef.current || isLoading) return; // Don't act if loading
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Attempt to play, catch potential errors (e.g., user interaction needed)
      audioRef.current.play().catch(error => {
          console.error("[AudioPlayer] Error attempting to play audio:", error);
          toast({
             title: "Playback Error",
             description: "Could not start playback. User interaction might be required.",
             status: "warning",
             duration: 3000,
             isClosable: true,
          });
          setIsPlaying(false); // Ensure state reflects failure
      });
    }
    // Note: isPlaying state is set by the onPlay/onPause event handlers on the <audio> tag
  };

  // Called when the audio track finishes playing
   const handleEnded = () => {
     console.log("[AudioPlayer] Track ended.");
     setIsPlaying(false);
     setCurrentTime(0); // Reset playback position
     // Optionally move to next track if implementing playlists
   };

  // --- Control Handlers ---
  // Called when the user drags the seek slider
  const handleSeek = (value: number) => {
    if (audioRef.current && !isNaN(value) && isFinite(value)) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Called when the user changes the volume slider
  const handleVolumeChange = (value: number) => {
     const newVolume = value / 100; // Slider is 0-100, volume is 0.0-1.0
    if (audioRef.current) {
       audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0); // Automatically mute if volume is set to 0
  };

  // Called when the mute button is clicked
  const toggleMute = () => {
     if (!audioRef.current) return;
     const newMuted = !audioRef.current.muted; // Toggle based on current state
     audioRef.current.muted = newMuted;
     setIsMuted(newMuted);
     // If unmuting and volume was 0, set to a default level
     if (!newMuted && volume === 0) {
        handleVolumeChange(50); // Set volume to 50%
     }
  };


  // --- Utility Functions ---
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Render Logic ---

  // Initial Loading State (before metadata fetch attempt completes) or Error
  if (isLoading && !metadata) {
     return (
          <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white" maxW="600px" mx="auto" my={4}>
             <Flex align="center">
                <Skeleton boxSize="80px" borderRadius="md" mr={4} />
                <Box flex="1">
                   <Skeleton height="20px" width="80%" mb={2} />
                   <Skeleton height="14px" width="60%" mb={1} />
                   <Skeleton height="12px" width="50%" />
                </Box>
             </Flex>
             <Skeleton height="10px" width="100%" mt={4} mb={3} />
             <Flex justify="center" align="center" mt={3}>
                  <Skeleton borderRadius="full" height="40px" width="40px" mx={4} />
                 <Skeleton height="20px" width="100px" />
             </Flex>
          </Box>
     )
  }

  if (error) {
      return (
          <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="red.50" maxW="600px" mx="auto" my={4}>
             <Text color="red.600" fontSize="sm">Error: {error}</Text>
          </Box>
      )
  }

  if (!metadata) {
      // This state shouldn't be reached if loading/error handled above, but acts as a fallback
      return <Box p={4} maxW="600px" mx="auto" my={4}><Text fontSize="sm" color="gray.500">Player unavailable.</Text></Box>;
  }

  // Main Player UI (Rendered once metadata is available)
  return (
    <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg="gray.50" // Light background for the player
        maxW="600px"
        my={4} // Margin top/bottom for spacing within article
        data-player-id={musicId}
    >
       {/* Hidden HTML5 Audio element */}
       <audio
          ref={audioRef}
          src={streamUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={handleCanPlay}
          onError={(e) => { console.error("Audio Element Error:", e); setError("Error loading audio stream."); setIsLoading(false); }}
          preload="metadata" // Hint to browser to load metadata quickly
       />

       {/* Top Section: Cover Art & Track Info */}
       <Flex align="center" mb={4}>
          <Image
             boxSize={{ base: "60px", sm: "80px" }} // Responsive size
             objectFit="cover"
             src={coverArtUrl || undefined} // Use undefined src to trigger fallback
             fallbackSrc='https://via.placeholder.com/80?text=♪' // Use a musical note placeholder
             alt={metadata.album ? `${metadata.album} cover` : 'Audio track cover'}
             borderRadius="md"
             mr={4}
          />
          <Box flex="1" minW="0"> {/* Prevents text overflow */}
             <Heading size="sm" fontWeight="medium" noOfLines={1} title={metadata.title}>{metadata.title || "Unknown Title"}</Heading>
             <Text fontSize="sm" color="gray.600" noOfLines={1} title={metadata.artist}>{metadata.artist || "Unknown Artist"}</Text>
             <Text fontSize="xs" color="gray.500" noOfLines={1} title={metadata.album}>{metadata.album || "Unknown Album"}</Text>
          </Box>
           {/* Optional Download Button */}
           <Tooltip label="Download Track" aria-label="Download Track">
                <IconButton
                    as="a"
                    href={streamUrl}
                    // Suggest a filename - ensure special characters are handled if needed
                    download={`${metadata.artist || 'Unknown'} - ${metadata.title || 'Track'}.mp3`}
                    icon={<FaDownload />}
                    aria-label="Download track"
                    variant="ghost"
                    colorScheme='gray' // Subtle download button
                    size="sm"
                    ml={2}
                    // Only enable download when track seems ready? Or always allow?
                    // isDisabled={isLoading || duration === 0}
                />
           </Tooltip>
       </Flex>

       {/* Seek Slider & Time Displays */}
       <Flex align="center" my={1}>
          <Text fontSize="xs" color="gray.500" mr={2} minW="40px" textAlign="right">{formatTime(currentTime)}</Text>
          <Slider
             aria-label="audio-seek-slider"
             value={currentTime}
             min={0}
             max={duration || 1} // Use 1 as max if duration is 0 to prevent errors
             onChange={handleSeek}
             focusThumbOnChange={false}
             isDisabled={duration === 0 || isLoading} // Disable until duration is known
             mx={2}
             flex="1"
             colorScheme="teal" // Match theme
          >
             <SliderTrack bg="gray.300">
                <SliderFilledTrack bg="teal.500" />
             </SliderTrack>
             {/* Show tooltip only when interacting maybe? Or keep it simple */}
             <SliderThumb boxSize={3} />
          </Slider>
          <Text fontSize="xs" color="gray.500" ml={2} minW="40px">{formatTime(duration)}</Text>
       </Flex>

       {/* Main Controls: Play/Pause & Volume */}
       <Flex justify="space-between" align="center" mt={2}>
           {/* Spacer to push volume right */}
           <Box w="50px" />

           {/* Play/Pause Button (Center) */}
           <IconButton
             icon={isPlaying ? <FaPause /> : <FaPlay />}
             aria-label={isPlaying ? 'Pause' : 'Play'}
             onClick={handlePlayPause}
             colorScheme="teal"
             size="md"
             isRound
             isDisabled={duration === 0 || isLoading} // Disable until ready
             mx={2}
           />

          {/* Volume Control (Right) */}
           <Flex align="center" width="120px" justify="flex-end"> {/* Fixed width helps alignment */}
               <IconButton
                   icon={isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                   aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                   onClick={toggleMute}
                   variant="ghost"
                   colorScheme='gray'
                   size="sm"
                   mr={2}
               />
               <Slider
                   aria-label="volume-slider"
                   value={isMuted ? 0 : volume * 100}
                   min={0}
                   max={100}
                   onChange={handleVolumeChange}
                   size="sm"
                   colorScheme="teal"
                   flex="1" // Allow slider to take remaining space
               >
                   <SliderTrack bg="gray.300">
                       <SliderFilledTrack bg="teal.500" />
                   </SliderTrack>
                   <SliderThumb boxSize={2.5} />
               </Slider>
           </Flex>

       </Flex>
    </Box>
  );
};

export default AudioPlayer;