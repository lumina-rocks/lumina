import { useEffect, useRef, useState } from "react";
import { useNostrEvents, useNostr, dateToUnix } from "nostr-react";
import { ChevronUp, ChevronDown, Heart, MessageCircle, Share2, User, X, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { nip19, Event as NostrEvent } from "nostr-tools";
import { useProfile } from "nostr-react";
import Link from "next/link";
import { blacklistPubkeys, signEvent } from "@/utils/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Simple video event interface
interface VideoEvent {
  id: string;
  pubkey: string;
  created_at: number;
  title: string;
  description: string;
  videoUrl: string;
  imageUrl: string;
}

const ReelFeed: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [videoEvents, setVideoEvents] = useState<VideoEvent[]>([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoEvent | null>(null);
  const [commentText, setCommentText] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  
  const { publish, connectedRelays } = useNostr();
  
  // Get current user pubkey
  const [currentUserPubkey, setCurrentUserPubkey] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const pubkey = localStorage.getItem('pubkey');
    setCurrentUserPubkey(pubkey);
  }, []);

  // Convert npub to hex if needed
  const currentUserHexPubkey = currentUserPubkey?.startsWith('npub') 
    ? nip19.decode(currentUserPubkey).data as string 
    : currentUserPubkey;
  
  // Fetch user's follow list
  const { events: followListEvents } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: currentUserHexPubkey ? [currentUserHexPubkey] : [],
      limit: 1,
    },
    enabled: !!currentUserHexPubkey,
  });

  // Extract followed pubkeys
  const followedPubkeys = followListEvents[0]?.tags
      .filter(tag => tag[0] === 'p')
    .map(tag => tag[1]) || [];

  // Fetch videos from follows
  const { events: followVideos } = useNostrEvents({
    filter: {
      kinds: [21, 22],
      authors: followedPubkeys,
      limit: 5,
    },
    enabled: followedPubkeys.length > 0,
  });

  // Fetch global videos
  const { events: globalVideos } = useNostrEvents({
    filter: {
      kinds: [21, 22],
      limit: 5,
    },
  });

  // Fetch tagged events with reel-related hashtags
  const reelTags = ['reels', 'reel', 'vlogs', 'vlog'];
  const { events: taggedEvents } = useNostrEvents({
    filter: {
      kinds: [1],
      "#t": reelTags,
      limit: 5,
    },
  });

  // Fetch replies that contain reel tags
  const { events: replyEvents } = useNostrEvents({
    filter: {
      kinds: [1],
      "#t": reelTags,
      limit: 5,
    },
  });

  // Extract event IDs that are being replied to
  const repliedToEventIds = replyEvents
    .filter(event => event.tags.some(tag => tag[0] === 'e'))
    .map(event => event.tags.find(tag => tag[0] === 'e')?.[1])
    .filter(Boolean) as string[];

  // Fetch the original events that are being replied to
  const { events: originalRepliedEvents } = useNostrEvents({
    filter: {
      kinds: [1],
      ids: repliedToEventIds,
      limit: 5,
    },
    enabled: repliedToEventIds.length > 0,
  });
  
  // Helper function to extract video URL from imeta tags
  const getVideoUrl = (tags: string[][]): string | null => {
    for (const tag of tags) {
      if (tag[0] === 'imeta') {
        for (let i = 1; i < tag.length; i++) {
          if (tag[i].startsWith('url ')) {
            return tag[i].substring(4);
          }
        }
      }
    }
    return null;
  };

  // Helper function to extract image URL from imeta tags
  const getImageUrl = (tags: string[][]): string | null => {
    for (const tag of tags) {
      if (tag[0] === 'imeta') {
        for (let i = 1; i < tag.length; i++) {
          if (tag[i].startsWith('image ')) {
            return tag[i].substring(6);
          }
        }
      }
    }
    return null;
  };

  // Helper function to check if content contains reel hashtags
  const hasReelHashtags = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    return reelTags.some(tag => lowerContent.includes(`#${tag}`));
  };

  // Helper function to check if tags contain reel hashtags
  const hasReelTagTags = (tags: string[][]): boolean => {
    return tags.some(tag => tag[0] === 't' && reelTags.includes(tag[1].toLowerCase()));
  };

    // Parse video events
  useEffect(() => {
    const allEvents = [...(followVideos || []), ...(globalVideos || [])];
    const parsedEvents: VideoEvent[] = [];
    const seenIds = new Set<string>();

    allEvents.forEach(event => {
      if (blacklistPubkeys.has(event.pubkey)) return;
      if (seenIds.has(event.id)) return; // Skip if we've already seen this event

      const videoUrl = getVideoUrl(event.tags);
      if (!videoUrl) return;

      const imageUrl = getImageUrl(event.tags) || '';
      const title = event.tags.find(tag => tag[0] === 'title')?.[1] || 'Untitled Video';

      parsedEvents.push({
            id: event.id,
            pubkey: event.pubkey,
            created_at: event.created_at,
            title,
            description: event.content,
            videoUrl,
            imageUrl,
        });
      
      seenIds.add(event.id); // Mark this event as seen
    });

    // Add tagged events (kind 1 with reel hashtags) - only if they have actual video content
    const taggedVideoEvents: VideoEvent[] = [];
    taggedEvents.forEach(event => {
      if (blacklistPubkeys.has(event.pubkey)) return;
      if (seenIds.has(event.id)) return;

      // Check if event has reel hashtags in content or tags
      if (!hasReelHashtags(event.content) && !hasReelTagTags(event.tags)) return;

      // Only include events that have actual video URLs
      const videoUrl = getVideoUrl(event.tags);
      if (!videoUrl) return; // Skip text-only posts

      const imageUrl = getImageUrl(event.tags) || '';
      const title = event.tags.find(tag => tag[0] === 'title')?.[1] || 'Reel Post';

      taggedVideoEvents.push({
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        title,
        description: event.content,
        videoUrl,
        imageUrl,
      });

      seenIds.add(event.id);
    });

    // Add original events that are being replied to with reel tags - only if they have actual video content
    const repliedVideoEvents: VideoEvent[] = [];
    originalRepliedEvents.forEach(event => {
      if (blacklistPubkeys.has(event.pubkey)) return;
      if (seenIds.has(event.id)) return;

      // Only include events that have actual video URLs
      const videoUrl = getVideoUrl(event.tags);
      if (!videoUrl) return; // Skip text-only posts

      const imageUrl = getImageUrl(event.tags) || '';
      const title = event.tags.find(tag => tag[0] === 'title')?.[1] || 'Replied Reel';

      repliedVideoEvents.push({
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        title,
        description: event.content,
        videoUrl,
        imageUrl,
      });

      seenIds.add(event.id);
    });

    // Combine all events and sort by creation time (newest first)
    const allVideoEvents = [...parsedEvents, ...taggedVideoEvents, ...repliedVideoEvents];
    allVideoEvents.sort((a, b) => b.created_at - a.created_at);
    setVideoEvents(allVideoEvents);
  }, [followVideos, globalVideos, taggedEvents, originalRepliedEvents]);

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

  // Keyboard handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentVideoIndex > 0) {
          setCurrentVideoIndex(prev => prev - 1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentVideoIndex < videoEvents.length - 1) {
          setCurrentVideoIndex(prev => prev + 1);
        }
        break;
      case ' ':
        e.preventDefault();
        const currentVideo = videoRefs.current[videoEvents[currentVideoIndex]?.id];
        if (currentVideo) {
          if (currentVideo.paused) {
            currentVideo.play().catch(err => console.error("Error playing video:", err));
          } else {
            currentVideo.pause();
          }
        }
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        setIsAudioMuted(prev => !prev);
        break;
    }
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
        videoElement.muted = isAudioMuted;
        videoElement.volume = volume;
      }
    });
  }, [currentVideoIndex, videoEvents, isAudioMuted, volume]);

  // Toggle like
  const toggleLike = async (id: string) => {
    const loginType = typeof window !== 'undefined' ? localStorage.getItem('loginType') : null;
    
    if (!loginType || !currentUserHexPubkey) {
      toast({
        title: "Login required",
        description: "Please login to like videos",
        variant: "destructive"
      });
      return;
    }
    
    const eventToSend: Partial<NostrEvent> = {
      kind: 7,
      content: isLiked[id] ? '' : '+',
      tags: [['e', id]],
      created_at: dateToUnix(),
    };

    try {
      const signedEvent = await signEvent(loginType, eventToSend as NostrEvent);
      if (signedEvent) {
        publish(signedEvent);
        toast({
          title: isLiked[id] ? "Unliked" : "Liked",
          description: `Successfully ${isLiked[id] ? 'removed like from' : 'liked'} the video`,
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

  // Open comment modal
  const openCommentModal = (video: VideoEvent) => {
    const loginType = typeof window !== 'undefined' ? localStorage.getItem('loginType') : null;
    
    if (!loginType) {
      toast({
        title: "Login required",
        description: "Please login to comment on videos",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedVideo(video);
    setCommentModalOpen(true);
  };

  // Submit comment
  const submitComment = async () => {
    if (!selectedVideo || !commentText.trim()) return;
    
    const loginType = typeof window !== 'undefined' ? localStorage.getItem('loginType') : null;
    if (!loginType) return;

    const eventToSend: Partial<NostrEvent> = {
      kind: 1,
      content: commentText,
      tags: [['e', selectedVideo.id]],
      created_at: dateToUnix(),
    };

    try {
      const signedEvent = await signEvent(loginType, eventToSend as NostrEvent);
      if (signedEvent) {
        publish(signedEvent);
        toast({
          title: "Comment posted",
          description: "Your comment has been posted successfully",
        });
        setCommentText("");
        setCommentModalOpen(false);
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error("Error sending comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    }
  };

  // Open share modal
  const openShareModal = (video: VideoEvent) => {
    setSelectedVideo(video);
    setShareModalOpen(true);
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  if (videoEvents.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p>Loading videos...</p>
          {isClient && currentUserPubkey && (
            <div className="mt-4 text-sm text-gray-400">
              <p>Debug Info:</p>
              <p>User: {currentUserPubkey.slice(0, 8)}...</p>
              <p>Follows: {followedPubkeys.length}</p>
              <p>Follow Videos: {followVideos?.length || 0}</p>
              <p>Global Videos: {globalVideos?.length || 0}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
          onComment={() => openCommentModal(video)}
          onShare={() => openShareModal(video)}
          isAudioMuted={isAudioMuted}
          volume={volume}
          currentUserPubkey={currentUserPubkey}
          isClient={isClient}
          setIsAudioMuted={setIsAudioMuted}
        />
      ))}
      
      {/* Progress indicators */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4 z-40">
        {videoEvents.map((_, index) => (
          <button
            key={index} 
            className={cn(
              "h-1 rounded-full transition-all cursor-pointer",
              index === currentVideoIndex 
                ? "bg-white w-6" 
                : "bg-white/40 w-4"
            )}
            onClick={() => setCurrentVideoIndex(index)}
          />
        ))}
      </div>

      {/* Comment Modal */}
      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setCommentModalOpen(false);
                setCommentText("");
              }}>
                Cancel
              </Button>
              <Button onClick={submitComment} disabled={!commentText.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedVideo && (
              <>
                <div>
                  <Label>Video Event (nevent)</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                    <code className="text-sm flex-1 break-all">
                      {nip19.neventEncode({
                        id: selectedVideo.id,
                        relays: []
                      })}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(
                        nip19.neventEncode({
                          id: selectedVideo.id,
                          relays: []
                        }),
                        "nevent"
                      )}
                    >
                      {copiedText === "nevent" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Author Profile (npub)</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                    <code className="text-sm flex-1 break-all">
                      {nip19.npubEncode(selectedVideo.pubkey)}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(
                        nip19.npubEncode(selectedVideo.pubkey),
                        "npub"
                      )}
                    >
                      {copiedText === "npub" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShareModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface VideoEventDisplayProps {
  video: VideoEvent;
  index: number;
  currentIndex: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  isLiked: boolean;
  toggleLike: () => void;
  onComment: () => void;
  onShare: () => void;
  isAudioMuted: boolean;
  volume: number;
  currentUserPubkey: string | null;
  isClient: boolean;
  setIsAudioMuted: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const VideoEventDisplay: React.FC<VideoEventDisplayProps> = ({ 
  video, 
  index, 
  currentIndex, 
  videoRef,
  isLiked,
  toggleLike,
  onComment,
  onShare,
  isAudioMuted,
  volume,
  currentUserPubkey,
  isClient,
  setIsAudioMuted
}) => {
  const { data: userData } = useProfile({
    pubkey: video.pubkey,
  });

  const username = userData?.name || userData?.display_name || 
    `${nip19.npubEncode(video.pubkey).slice(0, 8)}...`;
  
  const profileImageSrc = userData?.picture || `https://robohash.org/${video.pubkey}`;
  const npub = nip19.npubEncode(video.pubkey);
  const profileUrl = `/profile/${npub}`;

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
        className="w-full h-full object-contain bg-black"
        loop
        muted={isAudioMuted}
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
              <span className="text-white text-xs mt-1">0</span>
            </button>
            <button 
              className="flex flex-col items-center"
              onClick={onComment}
            >
              <MessageCircle className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">0</span>
            </button>
            <button 
              className="flex flex-col items-center"
              onClick={onShare}
            >
              <Share2 className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">0</span>
            </button>
            
            {/* Audio Controls */}
            <button 
              className="flex flex-col items-center"
             onClick={() => setIsAudioMuted((prev: boolean) => !prev)}
              title={isAudioMuted ? "Unmute" : "Mute"}
            >
              {isAudioMuted ? (
                <VolumeX className="h-8 w-8 text-white" />
              ) : (
              <Volume2 className="h-8 w-8 text-white" />
              )}
              <span className="text-white text-xs mt-1">
                {isAudioMuted ? "Muted" : `${Math.round(volume * 100)}%`}
              </span>
                </button>
                </div>
            </div>
          </div>
    </div>
  );
};

export default ReelFeed;