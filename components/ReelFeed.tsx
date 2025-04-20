import { useEffect, useRef, useState } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import { ChevronUp, ChevronDown, Heart, MessageCircle, Share2, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy video data for initial development
const dummyVideos = [
  {
    id: "1",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    username: "@user1",
    description: "This is an amazing video #nostr #lumina",
    likes: 1243,
    comments: 89,
    shares: 32
  },
  {
    id: "2",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "@user2",
    description: "Check out this cool Nostr project! #coding",
    likes: 853,
    comments: 42,
    shares: 21
  },
  {
    id: "3",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "@user3",
    description: "Learning about zaps and NIP-57 #bitcoin #lightning",
    likes: 2103,
    comments: 156,
    shares: 78
  },
  {
    id: "4",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    username: "@user4",
    description: "Exploring new Nostr clients #tutorial",
    likes: 543,
    comments: 37,
    shares: 19
  },
  {
    id: "5",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "@user5",
    description: "Decentralized social media is the future #nostr #web3",
    likes: 932,
    comments: 64,
    shares: 41
  }
];

const ReelFeed: React.FC = () => {
  const now = useRef(new Date());
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Fetch Nostr events - commented out for now while we use dummy data
  const { events } = useNostrEvents({
    filter: {
      kinds: [1063],
    },
  });

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
    
    if (isUpSwipe && currentVideoIndex < dummyVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else if (isDownSwipe && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Play current video and pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, videoElement]) => {
      if (videoElement) {
        if (id === dummyVideos[currentVideoIndex].id) {
          videoElement.play().catch(err => console.error("Error playing video:", err));
        } else {
          videoElement.pause();
        }
      }
    });
  }, [currentVideoIndex]);

  const toggleLike = (id: string) => {
    setIsLiked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
        {currentVideoIndex < dummyVideos.length - 1 && (
          <button 
            className="p-2 rounded-full bg-black/20 text-white"
            onClick={() => setCurrentVideoIndex(prev => Math.min(dummyVideos.length - 1, prev + 1))}
          >
            <ChevronDown className="h-8 w-8" />
          </button>
        )}
      </div>

      {/* Videos */}
      {dummyVideos.map((video, index) => (
        <div 
          key={video.id}
          className={cn(
            "absolute inset-0 transition-transform duration-300",
            index === currentVideoIndex ? "translate-y-0" : 
            index < currentVideoIndex ? "-translate-y-full" : "translate-y-full"
          )}
        >
          <video
            ref={el => videoRefs.current[video.id] = el}
            src={video.url}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay={index === currentVideoIndex}
          />
          
          {/* Video info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-end justify-between">
              <div className="text-white max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-bold">{video.username}</p>
                </div>
                <p className="text-sm">{video.description}</p>
              </div>

              {/* Interaction buttons */}
              <div className="flex flex-col items-center gap-4">
                <button 
                  className="flex flex-col items-center"
                  onClick={() => toggleLike(video.id)}
                >
                  <Heart 
                    className={cn(
                      "h-8 w-8", 
                      isLiked[video.id] ? "fill-red-500 text-red-500" : "text-white"
                    )}
                  />
                  <span className="text-white text-xs mt-1">{video.likes}</span>
                </button>
                <button className="flex flex-col items-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                  <span className="text-white text-xs mt-1">{video.comments}</span>
                </button>
                <button className="flex flex-col items-center">
                  <Share2 className="h-8 w-8 text-white" />
                  <span className="text-white text-xs mt-1">{video.shares}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Progress indicators */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4 z-30">
        {dummyVideos.map((_, index) => (
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

export default ReelFeed;