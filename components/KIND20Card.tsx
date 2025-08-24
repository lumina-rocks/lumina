import type React from "react"
import { useProfile } from "nostr-react"
import { nip19 } from "nostr-tools"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ReactionButton from "@/components/ReactionButton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ViewNoteButton from "./ViewNoteButton"
import Link from "next/link"
import type { Event as NostrEvent } from "nostr-tools"
import ZapButton from "./ZapButton"
import Image from "next/image"
import CardOptionsDropdown from "./CardOptionsDropdown"
import { renderTextWithLinkedTags } from "@/utils/textUtils"
import { getProxiedImageUrl, hasNsfwContent } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Eye, Play, Pause } from "lucide-react"

// Function to extract all images from a kind 20 event's imeta tags
const extractImagesFromEvent = (tags: string[][]): string[] => {
  return tags
    .filter(tag => tag[0] === 'imeta')
    .map(tag => {
      const urlItem = tag.find(item => item.startsWith('url '))
      return urlItem ? urlItem.split(' ')[1] : null
    })
    .filter(Boolean) as string[]
}

// Function to check if this is a video event
const isVideoEvent = (event: NostrEvent): boolean => {
  return event.kind === 21 || event.kind === 22;
}

// Function to extract video URL from imeta tags
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
}

const useImgProxy = process.env.NEXT_PUBLIC_ENABLE_IMGPROXY === "true"

interface KIND20CardProps {
  pubkey: string
  text: string
  image: string // keeping for backward compatibility
  eventId: string
  tags: string[][]
  event: NostrEvent
  showViewNoteCardButton: boolean
  videoUrl?: string // Optional video URL for video events
}

const KIND20Card: React.FC<KIND20CardProps> = ({
  pubkey,
  text,
  image,
  eventId,
  tags,
  event,
  showViewNoteCardButton,
  videoUrl: propVideoUrl,
}) => {
  const { data: userData } = useProfile({
    pubkey,
  })
  const [currentImage, setCurrentImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imagesWithoutProxy, setImagesWithoutProxy] = useState<Record<string, boolean>>({});
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);
  const [api, setApi] = useState<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Check if the event has nsfw content
  const isNsfwContent = hasNsfwContent(tags);
  
  // Check if this is a video event
  const isVideo = isVideoEvent(event);
  
  // Get video URL for video events - prefer prop over extracted
  const videoUrl = propVideoUrl || (isVideo ? getVideoUrl(tags) : null);
  
  // Extract all images from imeta tags
  const imetaImages = extractImagesFromEvent(tags);
  
  // For video events, if a thumbnail image is provided, use it directly
  // For image events, use imeta images or fallback to provided image
  const allImages = isVideo && image && image.startsWith("http") 
    ? [image] 
    : imetaImages.length > 0 
      ? imetaImages 
      : (image && image.startsWith("http") ? [image] : []);
  
  // For video events, check if we have a thumbnail to show initially
  const hasThumbnail = isVideo && image && image.startsWith("http");
  
  // Filter out images with errors
  const validImages = allImages.filter(img => !imageErrors[img]);
  
  // Handle image error by first trying without proxy, then marking as error if that fails too
  const handleImageError = (errorImage: string) => {
    if (imagesWithoutProxy[errorImage]) {
      // Already tried without proxy, mark as error
      setImageErrors(prev => ({
        ...prev,
        [errorImage]: true
      }));
    } else {
      // Try without proxy
      setImagesWithoutProxy(prev => ({
        ...prev,
        [errorImage]: true
      }));
    }
  }

  // Toggle sensitive content visibility
  const toggleSensitiveContent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSensitiveContent(true);
  };

  // Handle video play/pause
  const handleVideoToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!videoRef.current || !videoUrl) return;
    
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().catch(() => {
        // Auto-play failed, keep paused
        setIsVideoPlaying(false);
      });
      setIsVideoPlaying(true);
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

  // Handle video error
  const handleVideoError = () => {
    setIsVideoPlaying(false);
    // Could show an error message here if needed
  };

  // Update current image index when carousel slides
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrentImage(api.selectedScrollSnap());
    };
    
    api.on('select', onSelect);
    
    // Initial selection
    onSelect();
    
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);
  
  // If no valid images are available, don't render the card
  if (validImages.length === 0) return null;
  
  const title =
    userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey)
  
  // Extract title from event tags
  const eventTitle = tags.find(tag => tag[0] === 'title')?.[1] || ''
  
  text = text.replaceAll("\n", " ")
  const createdAt = new Date(event.created_at * 1000)
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey
  const uploadedVia = tags.find((tag) => tag[0] === "client")?.[1]

  return (
    <>
      <div key={event.id}>
        <Card className="my-4">
          <CardHeader className="flex flex-row items-center space-y-0">
            <CardTitle className="flex-1">
              <Link href={hrefProfile} style={{ textDecoration: "none" }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar>
                          <AvatarImage src={profileImageSrc} />
                          <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="break-all" style={{ marginLeft: "10px" }}>
                          {title}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            </CardTitle>
            <CardOptionsDropdown event={event} />
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">
              {validImages.length > 0 && (
                <div className="relative">
                  <Carousel 
                    className="w-full" 
                    setApi={setApi}
                  >
                    <CarouselContent>
                      {validImages.map((imageUrl, index) => {
                        const shouldUseProxy = useImgProxy && !imagesWithoutProxy[imageUrl];
                        const image = shouldUseProxy ? getProxiedImageUrl(imageUrl, 1200, 0) : imageUrl;
                        return (
                          <CarouselItem key={`${imageUrl}-${index}`}>
                            <div className="w-full flex justify-center">
                              <div className="relative w-full h-auto min-h-[300px] max-h-[80vh] flex justify-center">
                                <div className="relative w-full h-full">
                                  {isVideo && videoUrl ? (
                                    <>
                                      {/* Always render video element but hide it when showing thumbnail */}
                                      <video
                                        ref={videoRef}
                                        src={videoUrl}
                                        className={`rounded-lg w-full h-auto object-contain ${isNsfwContent && !showSensitiveContent ? 'blur-xl' : ''} ${hasThumbnail && !isVideoPlaying ? 'hidden' : ''}`}
                                        onEnded={handleVideoEnded}
                                        onError={handleVideoError}
                                        style={{
                                          maxHeight: "80vh",
                                          margin: "auto"
                                        }}
                                        muted
                                        loop
                                        playsInline
                                      />
                                      
                                      {/* Show thumbnail when available and video is not playing */}
                                      {hasThumbnail && !isVideoPlaying && (
                                        <img
                                          src={image}
                                          alt={text}
                                          className={`rounded-lg w-full h-auto object-contain ${isNsfwContent && !showSensitiveContent ? 'blur-xl' : ''} absolute inset-0`}
                                          onError={() => handleImageError(imageUrl)}
                                          loading="lazy"
                                          style={{
                                            maxHeight: "80vh",
                                            margin: "auto"
                                          }}
                                        />
                                      )}
                                      
                                      {/* Play/Pause button overlay */}
                                      <div 
                                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                        onClick={handleVideoToggle}
                                      >
                                        <div className="bg-black bg-opacity-70 hover:bg-opacity-80 rounded-full p-4 transition-all duration-200">
                                          {isVideoPlaying ? (
                                            <Pause className="w-8 h-8 text-white" />
                                          ) : (
                                            <Play className="w-8 h-8 text-white" />
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <img
                                      src={image}
                                      alt={text}
                                      className={`rounded-lg w-full h-auto object-contain ${isNsfwContent && !showSensitiveContent ? 'blur-xl' : ''}`}
                                      onError={() => handleImageError(imageUrl)}
                                      loading="lazy"
                                      style={{
                                        maxHeight: "80vh",
                                        margin: "auto"
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    {validImages.length > 1 && !isNsfwContent && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {`${currentImage + 1} / ${validImages.length}`}
                          </div>
                        </div>
                      </>
                    )}
                  </Carousel>
                  
                  {isNsfwContent && !showSensitiveContent && (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center z-10"
                      onClick={toggleSensitiveContent}
                    >
                      <Button 
                        variant="secondary" 
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-md"
                        onClick={toggleSensitiveContent}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Show Sensitive Content
                      </Button>
                      <p className="mt-2 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
                        This image may contain sensitive content
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4">
              {eventTitle && (
                <div className="mb-3">
                  <h3 className="font-bold text-lg">{eventTitle}</h3>
                </div>
              )}
              <div className="break-word overflow-hidden">{renderTextWithLinkedTags(text, tags)}</div>
              <hr className="my-4" />
              <div className="space-x-4 flex justify-between items-start">
                <div className="flex space-x-4">
                  <ReactionButton event={event} />
                  <ZapButton event={event} />
                  {showViewNoteCardButton && <ViewNoteButton event={event} />}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="grid grid-cols-1">
              <small className="text-secondary">{createdAt.toLocaleString()}</small>
              {uploadedVia && <small className="text-secondary">Uploaded via {uploadedVia}</small>}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

export default KIND20Card