import { useEffect, useRef, useState, useMemo } from "react";
import { useNostrEvents, useNostr, dateToUnix } from "nostr-react";
import { ChevronUp, ChevronDown, Heart, MessageCircle, Share2, User, X, Copy, Check, Activity } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

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
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoEvent | null>(null);
  const [commentText, setCommentText] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [commentExpires, setCommentExpires] = useState(true);
  const [showFeed, setShowFeed] = useState(false);
  const { publish } = useNostr();
  
  // Define reel tags for filtering
  const REEL_TAGS = ["reels", "reel", "vlog", "vlogs", "shorts", "short", "tiktok", "olas"];
  
  // Fetch all events (any kind) to check for videos with reel tags
  const { events: allEvents } = useNostrEvents({
    filter: {
      limit: 100 * loadMoreCounter, // Fetch more events to find videos with tags
    },
  });
  
  // Fetch NIP-71 kind 22 (short video) events
  const { events: kind22Events } = useNostrEvents({
    filter: {
      kinds: [22], // NIP-71 short videos
      limit: 50 * loadMoreCounter,
    },
  });
  
  // Fetch events that reply to or quote video events with reel tags
  const { events: replyEvents } = useNostrEvents({
    filter: {
      kinds: [1, 6, 7, 16, 1111, 9802], // Text notes, reposts, reactions
      limit: 100 * loadMoreCounter,
    },
  });

  // Helper function to check if an event contains a video
  const hasVideo = (event: NostrEvent): boolean => {
    // Check imeta tags for video mime types
    const imetaTags = event.tags.filter((tag: string[]) => tag[0] === "imeta");
    for (const imeta of imetaTags) {
      const mInfo = imeta.find((item: string) => item.startsWith("m "));
      if (mInfo && mInfo.startsWith("m video/")) {
        return true;
      }
    }
    
    // Check content for video URLs
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'm4a'];
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = event.content.match(urlRegex);
    
    if (urls) {
      for (const url of urls) {
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname.toLowerCase();
          const extension = pathname.split('.').pop();
          if (extension && videoExtensions.includes(extension)) {
            return true;
          }
        } catch (error) {
          // Invalid URL, continue checking other URLs
          continue;
        }
      }
    }
    
    return false;
  };

  // Helper function to check if an event has reel tags
  const hasReelTags = (event: NostrEvent): boolean => {
    // Check content for hashtags
    const contentLower = event.content.toLowerCase();
    if (REEL_TAGS.some(tag => contentLower.includes(`#${tag}`))) {
      return true;
    }
    
    // Check "t" tags
    const tTags = event.tags.filter((tag: string[]) => tag[0] === "t");
    return tTags.some((tag: string[]) => REEL_TAGS.includes(tag[1]?.toLowerCase()));
  };

  // Helper function to extract referenced event IDs from replies/quotes
  const getReferencedEventIds = (event: NostrEvent): string[] => {
    const referencedIds: string[] = [];
    
    // Check "e" tags (replies)
    const eTags = event.tags.filter((tag: string[]) => tag[0] === "e");
    referencedIds.push(...eTags.map((tag: string[]) => tag[1]));
    
    // Check "q" tags (quotes)
    const qTags = event.tags.filter((tag: string[]) => tag[0] === "q");
    referencedIds.push(...qTags.map((tag: string[]) => tag[1]));
    
    // Check "a" tags (mentions)
    const aTags = event.tags.filter((tag: string[]) => tag[0] === "a");
    referencedIds.push(...aTags.map((tag: string[]) => tag[1]));
    
    return referencedIds;
  };

  // Combine and filter all events
  const events = useMemo(() => {
    const allRawEvents = [...(allEvents || []), ...(kind22Events || []), ...(replyEvents || [])];
    
    // Filter out blacklisted pubkeys
    const filteredEvents = allRawEvents.filter((event: NostrEvent) => {
      const isBlacklisted = blacklistPubkeys.has(event.pubkey);
      return !isBlacklisted;
    });

    // Create a set of event IDs that should be included
    const includedEventIds = new Set<string>();
    
    // 1. Include all kind 22 events
    kind22Events?.forEach((event: NostrEvent) => {
      if (!blacklistPubkeys.has(event.pubkey)) {
        includedEventIds.add(event.id);
      }
    });
    
    // 2. Include events with videos and reel tags
    allEvents?.forEach((event: NostrEvent) => {
      if (!blacklistPubkeys.has(event.pubkey) && hasVideo(event) && hasReelTags(event)) {
        includedEventIds.add(event.id);
      }
    });
    
    // 3. Include original video events that are referenced by replies with reel tags
    replyEvents?.forEach((replyEvent: NostrEvent) => {
      if (!blacklistPubkeys.has(replyEvent.pubkey) && hasReelTags(replyEvent)) {
        const referencedIds = getReferencedEventIds(replyEvent);
        referencedIds.forEach(id => {
          // Find the original event and check if it has a video
          const originalEvent = allRawEvents.find(e => e.id === id);
          if (originalEvent && hasVideo(originalEvent)) {
            includedEventIds.add(id);
          }
        });
      }
    });
    
    // Return only the events that should be included
    return filteredEvents.filter((event: NostrEvent) => includedEventIds.has(event.id));
  }, [allEvents, kind22Events, replyEvents, loadMoreCounter]);

  // Load more events if we don't have enough after filtering
  useEffect(() => {
    const totalEvents = (allEvents?.length || 0) + (kind22Events?.length || 0) + (replyEvents?.length || 0);
    if (events.length < 20 && totalEvents > 0 && 
        totalEvents >= 250 * (loadMoreCounter - 1)) {
      setLoadMoreCounter(prev => prev + 1);
    }
  }, [events, allEvents, kind22Events, replyEvents, loadMoreCounter]);

  // Track reactions to update UI accordingly - use a stable array to prevent re-fetching
  const videoEventIds = useMemo(() => videoEvents.map(v => v.id), [videoEvents]);
  const { events: reactions } = useNostrEvents({
    filter: {
      kinds: [7], // Reaction events
      '#e': videoEventIds,
    },
  });

  // Fetch comments (kind 1111) for the videos - use a stable array to prevent re-fetching
  const { events: comments } = useNostrEvents({
    filter: {
      kinds: [1111], // Comment events
      '#e': videoEventIds,
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

  // Parse video events from all kinds
  useEffect(() => {
    if (!events || events.length === 0) return;

    const parsedEvents: VideoEvent[] = events
      .map(event => {
        try {
          // Find title tag
          const titleTag = event.tags.find((tag: string[]) => tag[0] === "title");
          const title = titleTag ? titleTag[1] : "Untitled Video";
          
          // Find duration tag
          const durationTag = event.tags.find((tag: string[]) => tag[0] === "duration");
          const duration = durationTag ? parseInt(durationTag[1]) : undefined;

          // Extract video data from imeta tags
          const imetaTags = event.tags.filter((tag: string[]) => tag[0] === "imeta");
          if (imetaTags.length === 0) return null;
          
          // Find the first valid imeta tag with a video URL
          let videoUrl = "";
          let imageUrl = "";
          let dimensions = undefined;
          let mimeType = undefined;
          
          for (const imeta of imetaTags) {
            // Parse dimension info
            const dimInfo = imeta.find((item: string) => item.startsWith("dim "));
            if (dimInfo) {
              const [width, height] = dimInfo.replace("dim ", "").split("x").map(Number);
              dimensions = { width, height };
            }
            
            // Parse mime type
            const mInfo = imeta.find((item: string) => item.startsWith("m "));
            if (mInfo) {
              mimeType = mInfo.replace("m ", "");
            }
            
            // Check if it's a video mime type
            if (mimeType && mimeType.startsWith("video/")) {
              // Get video URL
              const urlInfo = imeta.find((item: string) => item.startsWith("url "));
              if (urlInfo) {
                videoUrl = urlInfo.replace("url ", "");
              }
              
              // Get image preview URL
              const imageInfo = imeta.find((item: string) => item.startsWith("image "));
              if (imageInfo) {
                imageUrl = imageInfo.replace("image ", "");
              }
              
              if (videoUrl) break; // Found a valid video URL
            }
          }
          
          // If no video URL found in imeta tags, try to extract from content
          if (!videoUrl) {
            const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'm4a'];
            const urlRegex = /https?:\/\/[^\s]+/g;
            const urls = event.content.match(urlRegex);
            
            if (urls) {
              for (const url of urls) {
                try {
                  const urlObj = new URL(url);
                  const pathname = urlObj.pathname.toLowerCase();
                  const extension = pathname.split('.').pop();
                  if (extension && videoExtensions.includes(extension)) {
                    videoUrl = url;
                    break;
                  }
                } catch (error) {
                  // Invalid URL, continue checking other URLs
                  continue;
                }
              }
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

  // Keyboard handlers for desktop navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle arrow keys when feed is not open
    if (showFeed) return;
    
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
        // Toggle play/pause of current video
        const currentVideo = videoRefs.current[videoEvents[currentVideoIndex]?.id];
        if (currentVideo) {
          if (currentVideo.paused) {
            currentVideo.play().catch(err => console.error("Error playing video:", err));
          } else {
            currentVideo.pause();
          }
        }
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
        
        // Don't update UI immediately - let the useEffect handle it after the reaction is published
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

  // Toggle feed display
  const toggleFeed = () => {
    setShowFeed(prev => !prev);
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

    // Create base tags
    const tags = [
      ['e', selectedVideo.id], // Reference to the video event
      ['k', '22'], // Specify that we're commenting on a kind 22 event
    ];

    // Add expiration tag only if user wants the comment to expire
    if (commentExpires) {
      // Calculate expiration time (2 months from now)
      const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 60); // 60 days
      tags.push(['expiration', expirationTime.toString()]);
    }

    // Create a kind 1111 comment event
    const eventToSend: Partial<NostrEvent> = {
      kind: 1111,
      content: commentText,
      tags,
      created_at: dateToUnix(),
    };

    try {
      // Sign and publish the event
      const signedEvent = await signEvent(loginType, eventToSend as NostrEvent);
      
      if (signedEvent) {
        publish(signedEvent);
        
        toast({
          title: "Comment posted",
          description: "Your comment has been posted successfully",
        });
        
        // Reset form
        setCommentText("");
        setCommentExpires(true); // Reset to default (expires)
        setCommentModalOpen(false);
        setSelectedVideo(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to sign comment event",
          variant: "destructive"
        });
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
          reactionCount={countReactionsForEvent(reactions, video.id)}
          comments={getCommentsForEvent(comments, video.id)}
          reactions={getReactionsForEvent(reactions, video.id)}
          onComment={() => openCommentModal(video)}
          onShare={() => openShareModal(video)}
          showFeed={showFeed}
          toggleFeed={toggleFeed}
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

      {/* Keyboard navigation help (desktop only) */}
      <div className="hidden md:block absolute bottom-20 right-4 text-white/60 text-xs bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span>↑↓ Navigate</span>
          <span>•</span>
          <span>Space Play/Pause</span>
        </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="comment-expires"
                  checked={commentExpires}
                  onCheckedChange={setCommentExpires}
                />
                <Label htmlFor="comment-expires">
                  Comment expires in 2 months
                </Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setCommentModalOpen(false);
                setCommentText("");
                setCommentExpires(true);
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

// Helper function to count reactions for a specific event
function countReactionsForEvent(reactions: NostrEvent[], eventId: string): number {
  if (!reactions) return 0;
  
  return reactions.filter(reaction => {
    const eventTag = reaction.tags.find(tag => tag[0] === 'e');
    return eventTag && eventTag[1] === eventId && reaction.content !== '';
  }).length;
}

// Helper function to get comments for a specific event
function getCommentsForEvent(comments: NostrEvent[], eventId: string): NostrEvent[] {
  if (!comments) return [];
  
  return comments.filter(comment => {
    const eventTag = comment.tags.find(tag => tag[0] === 'e');
    return eventTag && eventTag[1] === eventId;
  }).sort((a, b) => a.created_at - b.created_at); // Sort by creation time
}

// Helper function to get reactions for a specific event
function getReactionsForEvent(reactions: NostrEvent[], eventId: string): NostrEvent[] {
  if (!reactions) return [];
  
  return reactions.filter(reaction => {
    const eventTag = reaction.tags.find(tag => tag[0] === 'e');
    return eventTag && eventTag[1] === eventId;
  });
}

// Component for displaying a single reaction
const ReactionItem: React.FC<{ reaction: NostrEvent }> = ({ reaction }) => {
  const { data: reactionUserData } = useProfile({
    pubkey: reaction.pubkey,
  });
  const reactionUsername = reactionUserData?.name || reactionUserData?.display_name || 
    `${nip19.npubEncode(reaction.pubkey).slice(0, 8)}...`;
  const reactionProfileImage = reactionUserData?.picture || `https://robohash.org/${reaction.pubkey}`;
  
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded">
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <img src={reactionProfileImage} alt={reactionUsername} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{reactionUsername}</p>
        <p className="text-gray-300 text-xs">
          {reaction.content === '+' ? '❤️ Liked' : 
           reaction.content === '-' ? '👎 Disliked' : 
           `Reacted: ${reaction.content}`}
        </p>
      </div>
      <span className="text-gray-400 text-xs">
        {new Date(reaction.created_at * 1000).toLocaleDateString()}
      </span>
    </div>
  );
};

// Component for displaying a single comment
const CommentItem: React.FC<{ comment: NostrEvent }> = ({ comment }) => {
  const { data: commentUserData } = useProfile({
    pubkey: comment.pubkey,
  });
  const commentUsername = commentUserData?.name || commentUserData?.display_name || 
    `${nip19.npubEncode(comment.pubkey).slice(0, 8)}...`;
  const commentProfileImage = commentUserData?.picture || `https://robohash.org/${comment.pubkey}`;
  
  return (
    <div className="p-2 bg-gray-800/50 rounded">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img src={commentProfileImage} alt={commentUsername} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{commentUsername}</p>
          <span className="text-gray-400 text-xs">
            {new Date(comment.created_at * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="text-white text-sm ml-11">{comment.content}</p>
    </div>
  );
};

interface VideoEventDisplayProps {
  video: VideoEvent;
  index: number;
  currentIndex: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  isLiked: boolean;
  toggleLike: () => void;
  reactionCount: number;
  comments: NostrEvent[];
  reactions: NostrEvent[];
  onComment: () => void;
  onShare: () => void;
  showFeed: boolean;
  toggleFeed: () => void;
}

const VideoEventDisplay: React.FC<VideoEventDisplayProps> = ({ 
  video, 
  index, 
  currentIndex, 
  videoRef,
  isLiked,
  toggleLike,
  reactionCount,
  comments,
  reactions,
  onComment,
  onShare,
  showFeed,
  toggleFeed
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
        className="w-full h-full object-contain bg-black"
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
            <button 
              className="flex flex-col items-center"
              onClick={onComment}
            >
              <MessageCircle className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">{commentsCount}</span>
            </button>
            <button 
              className="flex flex-col items-center"
              onClick={toggleFeed}
            >
              <Activity className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">Feed</span>
            </button>
            <button 
              className="flex flex-col items-center"
              onClick={onShare}
            >
              <Share2 className="h-8 w-8 text-white" />
              <span className="text-white text-xs mt-1">{sharesCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Overlay */}
      {showFeed && (
        <div className="absolute inset-0 bg-black/80 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Activity Feed</h3>
            <button 
              onClick={toggleFeed}
              className="text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Reactions Section */}
            {reactions.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Reactions ({reactions.length})</h4>
                <div className="space-y-2">
                  {reactions.slice(0, 10).map((reaction, idx) => (
                    <ReactionItem key={idx} reaction={reaction} />
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            {comments.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Comments ({comments.length})</h4>
                <div className="space-y-2">
                  {comments.slice(0, 10).map((comment, idx) => (
                    <CommentItem key={idx} comment={comment} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {reactions.length === 0 && comments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Activity className="h-12 w-12 mb-4" />
                <p className="text-center">No activity yet</p>
                <p className="text-sm text-center">Be the first to react or comment!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelFeed;