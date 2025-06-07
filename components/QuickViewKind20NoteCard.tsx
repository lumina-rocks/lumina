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
import { Eye } from 'lucide-react';
import { extractDimensions, getProxiedImageUrl, hasNsfwContent } from '@/utils/utils';

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

  if (!image || !image.startsWith("http")) return null;
  if (imageError && tryWithoutProxy) return null;

  const useImgProxy = process.env.NEXT_PUBLIC_ENABLE_IMGPROXY === "true" && !tryWithoutProxy;

  image = useImgProxy ? getProxiedImageUrl(image, 500, 0) : image;

  text = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id)

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
            <img 
              src={image || "/placeholder.svg"} 
              alt={text}
              className={`w-full h-full rounded lg:rounded-lg object-cover ${isNsfwContent && !showSensitiveContent ? 'blur-xl' : ''}`}
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
            {isNsfwContent && !showSensitiveContent && (
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
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );

  return (
    <>
      {linkToNote ? (
        <Link 
          href={`/note/${encodedNoteId}`} 
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