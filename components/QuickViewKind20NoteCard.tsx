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
import { extractDimensions, getProxiedImageUrl } from '@/utils/utils';

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

  if (!image || !image.startsWith("http")) return null;
  if (imageError && tryWithoutProxy) return null;

  const useImgProxy = process.env.NEXT_PUBLIC_ENABLE_IMGPROXY === "true" && !tryWithoutProxy;

  image = useImgProxy ? getProxiedImageUrl(image, 500, 0) : image;

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
              onError={() => {
                if (tryWithoutProxy) {
                  setImageError(true);
                } else {
                  setTryWithoutProxy(true);
                }
              }}
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