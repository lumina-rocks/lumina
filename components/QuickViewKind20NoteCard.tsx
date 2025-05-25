import React, { useState, useEffect } from 'react';
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
import { extractDimensions } from '@/utils/utils';

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
  const [retryCount, setRetryCount] = useState(0);
  const {data, isLoading} = useProfile({
    pubkey,
  });
  const [imageError, setImageError] = useState(false);

  // Add retry mechanism for profile loading
  useEffect(() => {
    // If userData is not loaded and we haven't exceeded max retries
    if (!data && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 2000); // Retry after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [data, retryCount]);

  if (!image || !image.startsWith("http") || imageError) return null;

  text = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id)

  const { width, height } = extractDimensions(event);

  const card = (
    <Card className="aspect-square overflow-hidden">
      <SmallCardContent className="h-full p-0">
        <div className="h-full w-full">
          <div className='relative w-full h-full'>
            <img 
              src={image || "/placeholder.svg"} 
              alt={text}
              className='w-full h-full rounded lg:rounded-lg object-cover' 
              loading="lazy"
              onError={() => setImageError(true)}
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );

  return (
    <>
      {linkToNote ? (
        <Link href={`/note/${encodedNoteId}`} className="block w-full aspect-square">
          {card}
        </Link>
      ) : (
        card
      )}
    </>
  );
}

export default QuickViewKind20NoteCard;