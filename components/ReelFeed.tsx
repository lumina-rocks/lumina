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

  // Extract video URL from imeta tags or r tags
  const getVideoUrl = (tags: string[][]) => {
    // First check imeta tags for video URLs
    for (const tag of tags) {
      if (tag[0] === 'imeta') {
        for (let i = 1; i < tag.length; i++) {
          if (tag[i].startsWith('url ')) {
            const url = tag[i].substring(4);
            // Check if it's a video file
            if (url.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
              return url;
            }
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
    
    return null;
  };

  const videoUrl = getVideoUrl(event.tags);

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
    return null; // Skip events without video URLs
  }

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
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
              {event.tags.some((tag: string[]) => tag[0] === 't' && tag[1] === 'reels') && (
                <span className="bg-blue-500 px-2 py-1 rounded text-white">#reels</span>
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

const ReelFeed: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Get all events that could be reels (kind 22, or have #reels tag, or are replied to with #reels)
  const { events: kind22Events } = useNostrEvents({
    filter: {
      kinds: [22],
      limit: 100,
    },
  });

  const { events: reelsTaggedEvents } = useNostrEvents({
    filter: {
      "#t": ["reels"],
      limit: 100,
    },
  });

  // Get events that are replied to with #reels
  const { events: reelsReplies } = useNostrEvents({
    filter: {
      "#t": ["reels"],
      kinds: [1], // replies are typically kind 1
      limit: 100,
    },
  });

  // Extract the event IDs that are being replied to with #reels
  const repliedToEventIds = reelsReplies
    .map(event => event.tags.find(tag => tag[0] === 'e')?.[1])
    .filter(id => id) as string[];

  // Get the actual events that are being replied to
  const { events: repliedToEvents } = useNostrEvents({
    filter: {
      ids: repliedToEventIds,
      limit: 100,
    },
  });

  // Combine all events and remove duplicates
  const allEvents = [...kind22Events, ...reelsTaggedEvents, ...repliedToEvents];
  const uniqueEvents = allEvents.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );

  // Filter out NSFW content
  let filteredEvents = uniqueEvents.filter((event) => !event.tags.some((tag) => { return tag[0] == 't' && tag[1] == 'nsfw'}));

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!isVisible) {
    return <div className="h-screen bg-black" />;
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Reels Found</h2>
          <p className="text-gray-400">Try posting a kind 22 event or tag content with #reels!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen bg-black overflow-hidden"
      onWheel={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
        {filteredEvents.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white text-sm">
        {currentIndex + 1} / {filteredEvents.length}
      </div>
    </div>
  );
};

export default ReelFeed;