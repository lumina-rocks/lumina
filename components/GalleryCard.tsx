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
import { useProfileValue } from '@nostr-dev-kit/ndk-hooks';

interface GalleryCardProps {
  pubkey: string;
  eventId: string;
  imageUrl: string;
  linkToNote: boolean;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ pubkey, eventId, imageUrl, linkToNote }) => {
  const userData = useProfileValue(pubkey);

  const encodedNoteId = nip19.noteEncode(eventId);

  const card = (
    <Card>
      <SmallCardContent>
        <div>
          <div className='d-flex justify-content-center align-items-center'>
            <div style={{ position: 'relative' }}>
              <img src={imageUrl} className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: 'auto' }} alt={eventId} />
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