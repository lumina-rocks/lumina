import { useRef, useState, useEffect } from "react";
import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartIcon, ChatBubbleIcon, Share1Icon, PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface VideoReelProps {
  event: any;
  isActive: boolean;
}

const VideoReel: React.FC<VideoReelProps> = ({ event, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Extract video URL from imeta tags, r tags, or content
  const getVideoUrl = (tags: string[][], content: string) => {
    // First check imeta tags for video URLs
    for (const tag of tags) {
      if (tag[0] === 'imeta') {
        for (let i = 1; i < tag.length; i++) {
          const tagItem = tag[i];
          if (tagItem.startsWith('url ')) {
            const url = tagItem.substring(4);
            // Check if it's a video file
            if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
              return url;
            }
          }
          // Also check if the tag item itself is a video URL
          if (tagItem.match(/^https?:\/\/.*\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
            return tagItem;
          }
        }
      }
    }
    
    // Then check r tags for video URLs
    for (const tag of tags) {
      if (tag[0] === 'r') {
        const url = tag[1];
        if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
          return url;
        }
      }
    }
    
    // Check content field for video URLs
    if (content) {
      const videoUrlMatch = content.match(/https?:\/\/[^\s]+\.(mp4|webm|mov|avi|mkv|m4v)/i);
      if (videoUrlMatch) {
        return videoUrlMatch[0];
      }
    }
    
    return null;
  };

  const videoUrl = getVideoUrl(event.tags, event.content);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {
        // Auto-play failed, keep muted
        setIsMuted(true);
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  if (!videoUrl) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>No video content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handleVideoClick}
        playsInline
      />
      
      {/* Overlay Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`https://robohash.org/${event.pubkey}`} />
              <AvatarFallback>{event.pubkey.slice(0, 8)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">@{event.pubkey.slice(0, 8)}</p>
              <p className="text-xs opacity-80">Follow</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white">
            <Share1Icon className="h-5 w-5" />
          </Button>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          {/* Left Side - Content */}
          <div className="flex-1 max-w-xs">
            <p className="text-sm mb-2 line-clamp-3">{event.content}</p>
            <div className="flex items-center space-x-4 text-xs opacity-80">
              <span>#{event.pubkey.slice(0, 6)}</span>
              <span>#{event.kind}</span>
              {event.tags.some((tag: string[]) => tag[0] === 't' && REEL_TAGS.some(reelTag => tag[1].toLowerCase() === reelTag.toLowerCase())) && (
                <span className="bg-blue-500 px-2 py-1 rounded text-white">
                  #{event.tags.find((tag: string[]) => tag[0] === 't' && REEL_TAGS.some(reelTag => tag[1].toLowerCase() === reelTag.toLowerCase()))?.[1]}
                </span>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col items-center space-y-4">
            <Button variant="ghost" size="sm" className="text-white">
              <HeartIcon className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <ChatBubbleIcon className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white" onClick={toggleMute}>
              {isMuted ? (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.5 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.5l3.883-3.794a1 1 0 011.617.794zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.5 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.5l3.883-3.794a1 1 0 011.617.794zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-50">
          <div 
            className="h-full bg-white" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <PlayIcon className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

// Define reel tags at module level so they can be accessed by VideoReel component
const REEL_TAGS = ["reels", "vlog", "vlogs", "reel", "shorts", "short", "tiktok", "olas"];

const ReelFeed: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const [showWiderNetwork, setShowWiderNetwork] = useState(false);

  // Get current user's pubkey
  let userPubkey = '';
  if (typeof window !== 'undefined') {
    userPubkey = window.localStorage.getItem('pubkey') ?? '';
  }

  // Get user's follow list
  const { events: followEvents } = useNostrEvents({
    filter: {
      kinds: [3], // NIP-02 follow list
      authors: [userPubkey],
      limit: 1,
    },
    enabled: !!userPubkey,
  });

  // Extract followed pubkeys
  const followedPubkeys = followEvents[0]?.tags
    .filter(tag => tag[0] === 'p')
    .map(tag => tag[1]) || [];

  // Get all kind 22 events (video content) from follows first
  const { events: kind22FromFollows } = useNostrEvents({
    filter: {
      kinds: [22],
      authors: followedPubkeys,
      limit: 50,
    },
    enabled: followedPubkeys.length > 0,
  });

  // Get all kind 22 events from everyone else (only when showWiderNetwork is true)
  const { events: kind22FromOthers } = useNostrEvents({
    filter: {
      kinds: [22],
      limit: 50,
    },
    enabled: showWiderNetwork,
  });

  // Get all events tagged with reel-related tags from follows first
  const reelTags = REEL_TAGS;
  const { events: reelsTaggedFromFollows } = useNostrEvents({
    filter: {
      "#t": reelTags,
      authors: followedPubkeys,
      limit: 50,
    },
    enabled: followedPubkeys.length > 0,
  });

  // Get all events tagged with reel-related tags from everyone else (only when showWiderNetwork is true)
  const { events: reelsTaggedFromOthers } = useNostrEvents({
    filter: {
      "#t": reelTags,
      limit: 50,
    },
    enabled: showWiderNetwork,
  });

  // Get events that are replied to with reel-related tags from follows first
  const { events: reelsRepliesFromFollows } = useNostrEvents({
    filter: {
      "#t": reelTags,
      kinds: [1], // replies are typically kind 1
      authors: followedPubkeys,
      limit: 50,
    },
    enabled: followedPubkeys.length > 0,
  });

  // Get events that are replied to with reel-related tags from everyone else (only when showWiderNetwork is true)
  const { events: reelsRepliesFromOthers } = useNostrEvents({
    filter: {
      "#t": reelTags,
      kinds: [1], // replies are typically kind 1
      limit: 50,
    },
    enabled: showWiderNetwork,
  });

  // Extract all referenced event IDs (from e and q tags)
  const getReferencedEventIds = (events: any[]) => {
    const eventIds = new Set<string>();
    events.forEach(event => {
      event.tags.forEach((tag: string[]) => {
        if ((tag[0] === 'e' || tag[0] === 'q') && tag[1]) {
          eventIds.add(tag[1]);
        }
      });
    });
    return Array.from(eventIds);
  };

  const referencedEventIdsFromFollows = getReferencedEventIds([
    ...kind22FromFollows,
    ...reelsTaggedFromFollows,
    ...reelsRepliesFromFollows
  ]);

  const referencedEventIdsFromOthers = getReferencedEventIds([
    ...kind22FromOthers,
    ...reelsTaggedFromOthers,
    ...reelsRepliesFromOthers
  ]);

  // Get the actual events that are referenced
  const { events: referencedEventsFromFollows } = useNostrEvents({
    filter: {
      ids: referencedEventIdsFromFollows,
      limit: 100,
    },
    enabled: referencedEventIdsFromFollows.length > 0,
  });

  const { events: referencedEventsFromOthers } = useNostrEvents({
    filter: {
      ids: referencedEventIdsFromOthers,
      limit: 100,
    },
    enabled: showWiderNetwork && referencedEventIdsFromOthers.length > 0,
  });

  // Combine events in priority order: follows first, then others
  const followsEvents = [
    ...kind22FromFollows,
    ...reelsTaggedFromFollows,
    ...referencedEventsFromFollows
  ];

  const othersEvents = [
    ...kind22FromOthers,
    ...reelsTaggedFromOthers,
    ...referencedEventsFromOthers
  ];

  // Remove duplicates within each group
  const uniqueFollowsEvents = followsEvents.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );

  const uniqueOthersEvents = othersEvents.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );

  // Remove events from follows from the others list to avoid duplicates
  const followsEventIds = new Set(uniqueFollowsEvents.map(e => e.id));
  const filteredOthersEvents = uniqueOthersEvents.filter(event => !followsEventIds.has(event.id));

  // Combine in priority order: follows first, then others
  const allEvents = [...uniqueFollowsEvents, ...filteredOthersEvents];

  // Debug logging
  console.log('ReelFeed Debug:', {
    uniqueFollowsEvents: uniqueFollowsEvents.length,
    filteredOthersEvents: filteredOthersEvents.length,
    allEvents: allEvents.length,
    showWiderNetwork,
    userPubkey: userPubkey ? 'logged in' : 'not logged in',
    followedPubkeys: followedPubkeys.length
  });

  // Helper function to check if event has reel tags (case-insensitive)
  const hasReelTag = (event: any) => {
    return event.tags.some((tag: string[]) => 
      tag[0] === 't' && REEL_TAGS.some(reelTag => 
        tag[1].toLowerCase() === reelTag.toLowerCase()
      )
    );
  };

  // Filter out NSFW content and events without video URLs
  let filteredEvents = allEvents.filter((event) => {
    // Filter out NSFW content
    if (event.tags.some((tag) => tag[0] == 't' && tag[1] == 'nsfw')) {
      console.log('Filtered out NSFW event:', event.id);
      return false;
    }
    
    // Filter out events without video URLs
    const getVideoUrl = (tags: string[][], content: string, allReferencedEvents?: any[]) => {
      // First check imeta tags for video URLs
      for (const tag of tags) {
        if (tag[0] === 'imeta') {
          for (let i = 1; i < tag.length; i++) {
            const tagItem = tag[i];
            if (tagItem.startsWith('url ')) {
              const url = tagItem.substring(4);
              // Check if it's a video file
              if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
                return url;
              }
            }
            // Also check if the tag item itself is a video URL
            if (tagItem.match(/^https?:\/\/.*\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
              return tagItem;
            }
          }
        }
      }
      
      // Then check r tags for video URLs
      for (const tag of tags) {
        if (tag[0] === 'r') {
          const url = tag[1];
          if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
            return url;
          }
        }
      }
      
      // Check content field for video URLs
      if (content) {
        const videoUrlMatch = content.match(/https?:\/\/[^\s]+\.(mp4|webm|mov|avi|mkv|m4v)/i);
        if (videoUrlMatch) {
          return videoUrlMatch[0];
        }
      }
      
      // Check referenced events for video URLs
      if (allReferencedEvents) {
        for (const tag of tags) {
          if ((tag[0] === 'e' || tag[0] === 'q') && tag[1]) {
            const referencedEvent = allReferencedEvents.find(ref => ref.id === tag[1]);
            if (referencedEvent) {
              // Check referenced event's tags and content for video URLs
              for (const refTag of referencedEvent.tags) {
                if (refTag[0] === 'imeta') {
                  for (let i = 1; i < refTag.length; i++) {
                    const tagItem = refTag[i];
                    if (tagItem.startsWith('url ')) {
                      const url = tagItem.substring(4);
                      if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
                        return url;
                      }
                    }
                    if (tagItem.match(/^https?:\/\/.*\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
                      return tagItem;
                    }
                  }
                }
                if (refTag[0] === 'r') {
                  const url = refTag[1];
                  if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
                    return url;
                  }
                }
              }
              // Check referenced event's content
              if (referencedEvent.content) {
                const videoUrlMatch = referencedEvent.content.match(/https?:\/\/[^\s]+\.(mp4|webm|mov|avi|mkv|m4v)/i);
                if (videoUrlMatch) {
                  return videoUrlMatch[0];
                }
              }
            }
          }
        }
      }
      
      return null;
    };
    
    const allReferencedEvents = [...referencedEventsFromFollows, ...referencedEventsFromOthers];
    const videoUrl = getVideoUrl(event.tags, event.content, allReferencedEvents);
    if (videoUrl === null) {
      console.log('Filtered out event without video URL:', event.id, 'Tags:', event.tags);
    } else {
      console.log('Found video URL for event:', event.id, 'URL:', videoUrl);
    }
    return videoUrl !== null;
  });

  // Debug filtering results
  console.log('Filtering Results:', {
    beforeFiltering: allEvents.length,
    afterFiltering: filteredEvents.length,
    filteredOut: allEvents.length - filteredEvents.length
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle keyboard navigation and check if we need to load wider network
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < filteredEvents.length - 1) {
        e.preventDefault();
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        
        // Check if we're close to the bottom (within 3 items) and haven't loaded wider network yet
        if (newIndex >= filteredEvents.length - 3 && !showWiderNetwork) {
          setShowWiderNetwork(true);
        }
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredEvents.length, showWiderNetwork]);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;
    
    const distance = touchStartY - touchEndY;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentIndex < filteredEvents.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Check if we're close to the bottom (within 3 items) and haven't loaded wider network yet
      if (newIndex >= filteredEvents.length - 3 && !showWiderNetwork) {
        setShowWiderNetwork(true);
      }
    } else if (isDownSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setTouchStartY(0);
    setTouchEndY(0);
  };

  if (!isVisible) {
    return <div className="h-full w-full bg-black" />;
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Reels Found</h2>
          <p className="text-gray-400">Try posting a kind 22 event or tag content with #reels!</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug Info:</p>
            <p>Follows: {uniqueFollowsEvents.length}</p>
            <p>Others: {filteredOthersEvents.length}</p>
            <p>Total Events: {allEvents.length}</p>
            <p>User Pubkey: {userPubkey ? 'Logged in' : 'Not logged in'}</p>
            <p>Followed Pubkeys: {followedPubkeys.length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full w-full bg-black relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehavior: 'none' }}
    >
      {filteredEvents.map((event, index) => (
        <div 
          key={event.id} 
          className={`absolute inset-0 transition-opacity duration-300 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <VideoReel 
            event={event} 
            isActive={index === currentIndex} 
          />
        </div>
      ))}
      
      {/* Navigation Dots */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-10">
        {filteredEvents.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => {
              setCurrentIndex(index);
              
              // Check if we're close to the bottom (within 3 items) and haven't loaded wider network yet
              if (index >= filteredEvents.length - 3 && !showWiderNetwork) {
                setShowWiderNetwork(true);
              }
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white text-sm z-10">
        {currentIndex + 1} / {filteredEvents.length}
        {filteredEvents.length <= 1 && (
          <div className="text-xs text-gray-400 mt-1">
            Only one reel available
            {!showWiderNetwork && (
              <button 
                className="ml-2 bg-blue-500 px-2 py-1 rounded text-xs"
                onClick={() => setShowWiderNetwork(true)}
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelFeed;