import { useEffect, useRef, useState } from "react";
import { useNostrEvents, useNostr, dateToUnix } from "nostr-react";
import { ChevronUp, ChevronDown, Heart, MessageCircle, Share2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { nip19, Event as NostrEvent } from "nostr-tools";
import { useProfile } from "nostr-react";
import Link from "next/link";
import { blacklistPubkeys, signEvent } from "@/utils/utils";
import { toast } from "@/components/ui/use-toast";

// Define interface for NIP-71 video event
interface VideoEvent {
  id: string;
  pubkey: string;
  created_at: number;
  title: string;
  description: string;
  videoUrl: string;
  imageUrl: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  mimeType?: string;
}

const ReelFeed: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [videoEvents, setVideoEvents] = useState<VideoEvent[]>([]);
  const [loadMoreCounter, setLoadMoreCounter] = useState(1); // Counter to trigger loading more events
  const { publish } = useNostr();
  
  // Fetch NIP-71 kind 22 (short video) events with increased limit
  const { events: rawEvents } = useNostrEvents({
    filter: {
      kinds: [22], // NIP-71 short videos
      limit: 50 * loadMoreCounter, // Increase limit based on counter
    },
  });

  // Filter out events from blacklisted pubkeys
  const events = rawEvents?.filter(event => {
    const isBlacklisted = blacklistPubkeys.has(event.pubkey);
    return !isBlacklisted;
  }) || [];

  // Load more events if we don't have enough after filtering
  useEffect(() => {
    // Check if we have enough events after filtering
    if (events.length < 20 && rawEvents && rawEvents.length > 0 && 
        // Make sure we're not in an infinite loop by checking if we have more events to load
        rawEvents.length >= 50 * (loadMoreCounter - 1)) {
      // Only increase counter if we actually received events but need more
      setLoadMoreCounter(prev => prev + 1);
    }
  }, [events, rawEvents, loadMoreCounter]);

  // Track reactions to update UI accordingly
  const { events: reactions } = useNostrEvents({
    filter: {
      kinds: [7], // Reaction events
      '#e': videoEvents.map(v => v.id),
    },
  });

  // Update liked status based on fetched reactions
  useEffect(() => {
    if (!reactions) return;
    
    // Check local storage for current user pubkey
    const storedPubkey = typeof window !== 'undefined' ? localStorage.getItem('pubkey') : null;
    if (!storedPubkey) return;
    
    // Update liked status for each video
    const likedStatus: Record<string, boolean> = {};
    
    reactions.forEach(reaction => {
      // Only count reactions from the current user
      if (reaction.pubkey === storedPubkey) {
        // Find the target event id
        const eventTag = reaction.tags.find(tag => tag[0] === 'e');
        if (eventTag && eventTag[1]) {
          likedStatus[eventTag[1]] = true;
        }
      }
    });
    
    setIsLiked(likedStatus);
  }, [reactions]);

  // Parse NIP-71 events
  useEffect(() => {
    if (!events || events.length === 0) return;

    const parsedEvents: VideoEvent[] = events
      .map(event => {
        try {
          // Find title tag
          const titleTag = event.tags.find(tag => tag[0] === "title");
          const title = titleTag ? titleTag[1] : "Untitled Video";
          
          // Find duration tag
          const durationTag = event.tags.find(tag => tag[0] === "duration");
          const duration = durationTag ? parseInt(durationTag[1]) : undefined;

          // Extract video data from imeta tags
          const imetaTags = event.tags.filter(tag => tag[0] === "imeta");
          if (imetaTags.length === 0) return null;
          
          // Find the first valid imeta tag with a video URL
          let videoUrl = "";
          let imageUrl = "";
          let dimensions = undefined;
          let mimeType = undefined;
          
          for (const imeta of imetaTags) {
            // Parse dimension info
            const dimInfo = imeta.find(item => item.startsWith("dim "));
            if (dimInfo) {
              const [width, height] = dimInfo.replace("dim ", "").split("x").map(Number);
              dimensions = { width, height };
            }
            
            // Parse mime type
            const mInfo = imeta.find(item => item.startsWith("m "));
            if (mInfo) {
              mimeType = mInfo.replace("m ", "");
            }
            
            // Check if it's a video mime type
            if (mimeType && mimeType.startsWith("video/")) {
              // Get video URL
              const urlInfo = imeta.find(item => item.startsWith("url "));
              if (urlInfo) {
                videoUrl = urlInfo.replace("url ", "");
              }
              
              // Get image preview URL
              const imageInfo = imeta.find(item => item.startsWith("image "));
              if (imageInfo) {
                imageUrl = imageInfo.replace("image ", "");
              }
              
              if (videoUrl) break; // Found a valid video URL
            }
          }
          
          if (!videoUrl) return null; // Skip if no valid video URL found
          
          return {
            id: event.id,
            pubkey: event.pubkey,
            created_at: event.created_at,
            title,
            description: event.content,
            videoUrl,
            imageUrl,
            duration,
            dimensions,
            mimeType
          };
        } catch (error) {
          console.error("Error parsing video event:", error);
          return null;
        }
      })
      .filter(Boolean) as VideoEvent[]; // Filter out null values
      
    setVideoEvents(parsedEvents);
  }, [events]);

  // Touch handlers for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;
    
    if (isUpSwipe && currentVideoIndex < videoEvents.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else if (isDownSwipe && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Play current video and pause others
  useEffect(() => {
    if (videoEvents.length === 0) return;
    
    Object.entries(videoRefs.current).forEach(([id, videoElement]) => {
      if (videoElement) {
        if (id === videoEvents[currentVideoIndex]?.id) {
          videoElement.play().catch(err => console.error("Error playing video:", err));
        } else {
          videoElement.pause();
        }
      }
    });
  }, [currentVideoIndex, videoEvents]);

  // Toggle like and send a Nostr reaction event
  const toggleLike = async (id: string) => {
    // Check if user is logged in
    const loginType = typeof window !== 'undefined' ? localStorage.getItem('loginType') : null;
    
    if (!loginType) {
      toast({
        title: "Login required",
        description: "Please login to like videos",
        variant: "destructive"
      });
      return;
    }
    
    // Create a reaction event
    const eventToSend: Partial<NostrEvent> = {
      kind: 7,
      content: isLiked[id] ? '' : '+', // Empty content to unlike, + to like
      tags: [
        ['e', id], // Reference to the video event
        ['k', '22'] // Specify that we're reacting to a kind 22 event
      ],
      created_at: dateToUnix(),
    };

    try {
      // Sign and publish the event
      const signedEvent = await signEvent(loginType, eventToSend as NostrEvent);
      
      if (signedEvent) {
        publish(signedEvent);
        
        // Update UI immediately
        setIsLiked(prev => ({
          ...prev,
          [id]: !prev[id]
        }));
        
        toast({
          title: isLiked[id] ? "Unliked" : "Liked",
          description: `Successfully ${isLiked[id] ? 'removed like from' : 'liked'} the video`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to sign reaction event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending reaction:", error);
      toast({
        title: "Error",
        description: "Failed to send reaction",
        variant: "destructive"
      });
    }
  };

  if (videoEvents.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation indicators */}
      <div className="absolute top-1/2 left-6 z-30 transform -translate-y-1/2">
        {currentVideoIndex > 0 && (
          <button 
            className="p-2 rounded-full bg-black/20 text-white"
            onClick={() => setCurrentVideoIndex(prev => Math.max(0, prev - 1))}
          >
            <ChevronUp className="h-8 w-8" />
          </button>
        )}
      </div>
      <div className="absolute top-1/2 left-6 z-30 transform translate-y-1/2">
        {currentVideoIndex < videoEvents.length - 1 && (
          <button 
            className="p-2 rounded-full bg-black/20 text-white"
            onClick={() => setCurrentVideoIndex(prev => Math.min(videoEvents.length - 1, prev + 1))}
          >
            <ChevronDown className="h-8 w-8" />
          </button>
        )}
      </div>

      {/* Videos */}
      {videoEvents.map((video, index) => (
        <VideoEventDisplay 
          key={video.id}
          video={video}
          index={index}
          currentIndex={currentVideoIndex}
          videoRef={el => videoRefs.current[video.id] = el}
          isLiked={!!isLiked[video.id]}
          toggleLike={() => toggleLike(video.id)}
          reactionCount={countReactionsForEvent(reactions, video.id)}
        />
      ))}
      
      {/* Progress indicators */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4 z-30">
        {videoEvents.map((_, index) => (
          <div 
            key={index} 
            className={cn(
              "h-1 rounded-full transition-all",
              index === currentVideoIndex 
                ? "bg-white w-6" 
                : "bg-white/40 w-4"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function to count reactions for a specific event
function countReactionsForEvent(reactions: NostrEvent[], eventId: string): number {
  if (!reactions) return 0;
  
  return reactions.filter(reaction => {
    const eventTag = reaction.tags.find(tag => tag[0] === 'e');
    return eventTag && eventTag[1] === eventId && reaction.content !== '';
  }).length;
}

interface VideoEventDisplayProps {
  video: VideoEvent;
  index: number;
  currentIndex: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  isLiked: boolean;
  toggleLike: () => void;
  reactionCount: number;
}

const VideoEventDisplay: React.FC<VideoEventDisplayProps> = ({ 
  video, 
  index, 
  currentIndex, 
  videoRef,
  isLiked,
  toggleLike,
  reactionCount
}) => {
  const { data: userData } = useProfile({
    pubkey: video.pubkey,
  });

  const username = userData?.name || userData?.display_name || 
    `${nip19.npubEncode(video.pubkey).slice(0, 8)}...`;
  
  const profileImageSrc = userData?.picture || `https://robohash.org/${video.pubkey}`;
  const npub = nip19.npubEncode(video.pubkey);
  const profileUrl = `/profile/${npub}`;

  // Use real reaction counts
  const likesCount = reactionCount;
  const commentsCount = 0; // Could be implemented by fetching kind 1 events that reference this video
  const sharesCount = 0; // Could be implemented by tracking reposts

  return (
    <div 
      className={cn(
        "absolute inset-0 transition-transform duration-300",
        index === currentIndex ? "translate-y-0" : 
        index < currentIndex ? "-translate-y-full" : "translate-y-full"
      )}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.imageUrl}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay={index === currentIndex}
      />
      
      {/* Video info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-end justify-between">
          <div className="text-white max-w-[80%]">
            <div className="flex items-center gap-2 mb-2">
              <Link href={profileUrl}>
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  {profileImageSrc ? (
                    <img src={profileImageSrc} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
              </Link>
              <div>
                <Link href={profileUrl}>
                  <p className="font-bold">{username}</p>
                </Link>
                {video.title && <p className="text-sm font-semibold">{video.title}</p>}
              </div>
            </div>
            <p className="text-sm">{video.description}</p>
          </div>

          {/* Interaction buttons */}
          <div className="flex flex-col items-center gap-4">
            <button 
              className="flex flex-col items-center"
              onClick={toggleLike}
            >
              <Heart 
                className={cn(
                  "h-8 w-8", 
                  isLiked ? "fill-red-500 text-red-500" : "text-white"
                )}
              />
              <span className="text-white text-xs mt-1">{likesCount}</span>
            </button>
            <button className="flex flex-col items-center">
              <MessageCircle className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">{commentsCount}</span>
            </button>
            <button className="flex flex-col items-center">
              <Share2 className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">{sharesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelFeed;