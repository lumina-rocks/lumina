import React from 'react';
import { useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import ReactionButton from '@/components/ReactionButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ViewNoteButton from './ViewNoteButton';
import Link from 'next/link';
import { Event as NostrEvent } from "nostr-tools";
import ZapButton from './ZapButton';
import CardOptionsDropdown from './CardOptionsDropdown';
import { renderTextWithLinkedTags } from '@/utils/textUtils';
import { PinIcon } from "lucide-react";

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
};

// Function to check if an event has reference tags (e, a, u)
const hasReferenceTags = (tags: string[][]): boolean => {
  return tags.some(tag => ['e', 'a', 'u'].includes(tag[0]));
};

// Function to get the first reference tag for opening source
const getFirstReferenceTag = (tags: string[][]): { type: string; value: string; relays?: string[] } | null => {
  for (const tag of tags) {
    if (tag[0] === 'e') {
      return { type: 'e', value: tag[1], relays: tag.slice(2) };
    }
    if (tag[0] === 'a') {
      return { type: 'a', value: tag[1], relays: tag.slice(2) };
    }
    if (tag[0] === 'u') {
      return { type: 'u', value: tag[1] };
    }
  }
  return null;
};



// Component for the purple pin icon
const PinButton: React.FC<{ 
  referenceTag: { type: string; value: string; relays?: string[] };
  onPinClick?: (referenceTag: { type: string; value: string; relays?: string[] }) => void;
}> = ({ referenceTag, onPinClick }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onPinClick) {
          onPinClick(referenceTag);
        }
      }}
      className="absolute top-3 right-3 z-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
      title="Open source"
    >
      <PinIcon className="w-3 h-3" />
    </button>
  );
};

interface NoteCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: NostrEvent;
  showViewNoteCardButton: boolean;
  onPinClick?: (referenceTag: { type: string; value: string; relays?: string[] }) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ pubkey, text, eventId, tags, event, showViewNoteCardButton, onPinClick }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  // text = text.replaceAll('\n', '<br />');
  text = text.replaceAll('\n', ' ');
  
  // Extract video URL from imeta tags for video events (kind 21 or 22)
  const imetaVideoUrl = (event.kind === 21 || event.kind === 22) ? getVideoUrl(tags) : null;
  
  // Combine text-based video detection with imeta-based detection
  const textVideoSrc = text.match(/https?:\/\/[^ ]*\.(mp4|webm|mov)/g);
  const videoSrc = imetaVideoUrl ? [imetaVideoUrl] : textVideoSrc;
  
  const imageSrc = text.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif|mp4|webm|mov|jpeg)/g, '');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

  // Check for reference tags and gallery tags
  const hasReferences = hasReferenceTags(tags);
  const referenceTag = getFirstReferenceTag(tags);
  const isGalleryTagged = text.includes('#gallery') || tags.some((tag: string[]) => tag[0] === 't' && tag[1] === 'gallery');

  return (
    <>
      <Card className="relative">
        {(hasReferences && referenceTag) || isGalleryTagged ? (
          <PinButton 
            referenceTag={referenceTag || { type: 'gallery', value: 'gallery' }} 
            onPinClick={onPinClick}
          />
        ) : null}
        <CardHeader className="flex flex-row items-center space-y-0">
          <CardTitle className="flex-1">
            <Link href={hrefProfile} style={{ textDecoration: 'none' }}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar>
                        <AvatarImage src={profileImageSrc} />
                        <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className='break-all' style={{ marginLeft: '10px' }}>{title}</span>
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
        <CardContent>
          <div className='py-4'>
            {
              <div>
                <div className='w-full h-full px-10'>
                  {imageSrc && imageSrc.length > 1 ? (
                    <Carousel>
                      <CarouselContent>
                        {imageSrc.map((src, index) => (
                          <CarouselItem key={index}>
                            <img
                              key={index}
                              src={src}
                              className='rounded lg:rounded-lg w-full h-auto object-contain'
                              style={{ maxHeight: '66vh', margin: 'auto' }}
                              alt={textWithoutImage || "Post image"}
                              loading="lazy"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    imageSrc ? 
                    <img 
                      src={imageSrc[0]} 
                      className='rounded lg:rounded-lg w-full h-auto object-contain' 
                      style={{ maxHeight: '66vh', margin: 'auto' }}
                      alt={textWithoutImage || "Post image"}
                      loading="lazy"
                    /> : ""
                  )}
                </div>
                <div className='w-full h-full px-10'>
                  {videoSrc && videoSrc.length > 1 ? (
                    <Carousel>
                      <CarouselContent>
                        {videoSrc.map((src, index) => (
                          <CarouselItem key={index}>
                            <video
                              key={index}
                              src={src}
                              controls
                              className='rounded lg:rounded-lg'
                              style={{ maxWidth: '100%', maxHeight: '66vh', objectFit: 'contain', margin: 'auto' }}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    videoSrc ? <video src={videoSrc[0]} controls className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '66vh', objectFit: 'contain', margin: 'auto' }} /> : ""
                  )}
                </div>
              </div>
            }
            <br />
            <div className='break-word overflow-hidden'>
              {renderTextWithLinkedTags(textWithoutImage, tags)}
            </div>
          </div>
          <hr />
          <div className='py-4 space-x-4 flex'>
            <div className='flex space-x-4'>
              <ReactionButton event={event} />
              <ZapButton event={event} />
              {showViewNoteCardButton && <ViewNoteButton event={event} />}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <small className="text-secondary">{createdAt.toLocaleString()}</small>
        </CardFooter>
      </Card>
    </>
  );
}

export default NoteCard;