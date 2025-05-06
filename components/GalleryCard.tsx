import React from 'react';
import { useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
import {
  Card,
  SmallCardContent,
} from "@/components/ui/card"
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, StackIcon, VideoIcon } from '@radix-ui/react-icons';

interface GalleryCardProps {
  pubkey: string;
  eventId: string;
  imageUrl: string;
  linkToNote: boolean;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ pubkey, eventId, imageUrl, linkToNote }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

  const encodedNoteId = nip19.noteEncode(eventId);

  const card = (
    <Card>
      <SmallCardContent>
        <div>
          <div className='d-flex justify-content-center align-items-center'>
            <div style={{ position: 'relative' }}>
              <img 
                src={imageUrl} 
                className='rounded lg:rounded-lg w-full h-full object-cover' 
                style={{ maxHeight: '75vh', margin: 'auto' }} 
                alt={eventId}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );

  return (
    <>
      {linkToNote ? (
        <Link href={`/note/${encodedNoteId}`}>
          {card}
        </Link>
      ) : (
        card
      )}
    </>
  );
}

export default GalleryCard;