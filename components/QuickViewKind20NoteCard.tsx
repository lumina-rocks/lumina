import React, { useState } from 'react';
import { useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
import {
  Card,
  SmallCardContent,
} from "@/components/ui/card"
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Eye, Play, PlayCircle } from 'lucide-react';
import { extractDimensions, getProxiedImageUrl, hasNsfwContent, getThumbnailUrl } from '@/utils/utils';

// Function to extract video URL from imeta tags
const getVideoUrl = (tags: string[][]): string | null => {
  for (const tag of tags) {
    if (tag[0] === 'imeta') {
      for (let i = 1; i < tag.length; i++) {
        if (tag[i].startsWith('url ')) {
          return tag[i].substring(4).trim();
        }
      }
    }
  }
  return null;
};

interface QuickViewKind20NoteCardProps {
  pubkey: string;
  text: string;
  image: string;
  eventId: string;
  tags: string[][];
  event: any;
  linkToNote: boolean;
}

const QuickViewKind20NoteCard: React.FC<QuickViewKind20NoteCardProps> = ({ pubkey, text, image, eventId, tags, event, linkToNote }) => {
  const {data, isLoading} = useProfile({
    pubkey,
  });
  const [imageError, setImageError] = useState(false);
  const [tryWithoutProxy, setTryWithoutProxy] = useState(false);
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);

  // Check if the event has nsfw content
  const isNsfwContent = hasNsfwContent(tags);
  
  // Check if this is a video
  const isVideo = event.kind === 21 || event.kind === 22;
  const videoUrl = isVideo ? getVideoUrl(tags) : null;
  const thumbnailUrl = isVideo ? getThumbnailUrl(tags) : null;

  // If no image is provided but we have a video URL, use the video URL as the image
  // For videos, prefer thumbnail URL if available, otherwise use video URL
  const displayImage = image || (isVideo && thumbnailUrl ? thumbnailUrl : videoUrl);

  // For video events, we don't need to check if the image starts with http
  // since video URLs are valid for display purposes
  if (!displayImage) return null;
  if (imageError && tryWithoutProxy && !isVideo) return null;

  const useImgProxy = process.env.NEXT_PUBLIC_ENABLE_IMGPROXY === "true" && !tryWithoutProxy;

  const processedImage = useImgProxy ? getProxiedImageUrl(displayImage, 500, 0) : displayImage;

  // For video events, don't process the text content
  const displayText = isVideo ? "" : text.replaceAll('\n', ' ');
  
  // Create nevent with relay hints
  const nevent = nip19.neventEncode({
      id: event.id,
      relays: event.relays || []
  })

  const { width, height } = extractDimensions(event);

  // Toggle sensitive content visibility
  const toggleSensitiveContent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSensitiveContent(true);
  };

  const card = (
    <Card className="aspect-square overflow-hidden">
      <SmallCardContent className="h-full p-0">
        <div className="h-full w-full">
          <div className='relative w-full h-full'>
            {imageError && tryWithoutProxy && !isVideo ? (
              // Fallback for failed images - show a placeholder with play button for videos
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                {isVideo ? (
                  <div className="bg-white bg-opacity-80 rounded-full p-3">
                    <Play className="h-6 w-6 text-black" />
                  </div>
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    <p className="text-sm">Image unavailable</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {isVideo ? (
                  // For videos, use the video element to show the first frame
                  <video 
                    src={videoUrl || ''} 
                    className={`w-full h-full rounded-lg object-cover ${isNsfwContent && !showSensitiveContent ? 'blur-xl' : ''}`}
                    preload="metadata"
                    playsInline
                    muted
                    // If we have a thumbnail, use it as poster
                    poster={thumbnailUrl ? processedImage : undefined}
                    onError={() => {
                      if (tryWithoutProxy) {
                        setImageError(true);
                      } else {
                        setTryWithoutProxy(true);
                      }
                    }}
                    style={{ objectPosition: 'center' }}
                  />
                ) : (
                  // For images, show the actual image
                  <img 
                    src={processedImage} 
                    alt={displayText}
                    className={`w-full h-full rounded-lg object-cover ${isNsfwContent && !showSensitiveContent ? 'blur-xl' : ''}`}
                    loading="lazy"
                    onError={() => {
                      if (tryWithoutProxy) {
                        setImageError(true);
                      } else {
                        setTryWithoutProxy(true);
                      }
                    }}
                    style={{ objectPosition: 'center' }}
                  />
                )}
                {isVideo && (
                  // Play button overlay for videos
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-70 rounded-full p-3">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
                {isNsfwContent && !showSensitiveContent && !isVideo && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    onClick={toggleSensitiveContent}
                  >
                    <Button 
                      variant="secondary" 
                      className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm"
                      onClick={toggleSensitiveContent}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Show
                    </Button>
                    <p className="mt-1 sm:mt-2 text-white text-xs sm:text-sm bg-black bg-opacity-50 p-1 sm:p-2 rounded max-w-[80%] text-center">
                      Sensitive Content
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );

  return (
    <>
      {linkToNote ? (
        <Link 
          href={`/note/${nevent}`} 
          className="block w-full aspect-square"
          onClick={isNsfwContent && !showSensitiveContent ? (e) => e.preventDefault() : undefined}
        >
          {card}
        </Link>
      ) : (
        card
      )}
    </>
  );
}

export default QuickViewKind20NoteCard;