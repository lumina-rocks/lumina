import type React from "react"
import { useProfile } from "nostr-react"
import { nip19 } from "nostr-tools"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ReactionButton from "@/components/ReactionButton"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ViewNoteButton from "./ViewNoteButton"
import Link from "next/link"
import type { Event as NostrEvent } from "nostr-tools"
import ZapButton from "./ZapButton"
import Image from "next/image"
import CardOptionsDropdown from "./CardOptionsDropdown"
import { renderTextWithLinkedTags } from "@/utils/textUtils"
import { getProxiedImageUrl } from "@/utils/utils"

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

const useImgProxy = process.env.NEXT_PUBLIC_ENABLE_IMGPROXY === "true"

interface KIND20CardProps {
  pubkey: string
  text: string
  image: string // keeping for backward compatibility
  eventId: string
  tags: string[][]
  event: NostrEvent
  showViewNoteCardButton: boolean
}

const KIND20Card: React.FC<KIND20CardProps> = ({
  pubkey,
  text,
  image,
  eventId,
  tags,
  event,
  showViewNoteCardButton,
}) => {
  const { data: userData } = useProfile({
    pubkey,
  })
  const [currentImage, setCurrentImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imagesWithoutProxy, setImagesWithoutProxy] = useState<Record<string, boolean>>({});
  const [api, setApi] = useState<any>(null);
  
  // Extract all images from imeta tags
  const imetaImages = extractImagesFromEvent(tags);
  
  // Use provided image as fallback if no imeta images are found
  const allImages = imetaImages.length > 0 ? imetaImages : (image && image.startsWith("http") ? [image] : []);
  
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
                              <img
                                src={image}
                                alt={text}
                                className="rounded-lg w-full h-auto object-contain"
                                onError={() => handleImageError(imageUrl)}
                                loading="lazy"
                                style={{
                                  maxHeight: "80vh",
                                  margin: "auto"
                                }}
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  {validImages.length > 1 && (
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
              )}
            </div>
            <div className="p-4">
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
              <small className="text-muted">{createdAt.toLocaleString()}</small>
              {uploadedVia && <small className="text-muted">Uploaded via {uploadedVia}</small>}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

export default KIND20Card