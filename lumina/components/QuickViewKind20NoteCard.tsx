import React from 'react';
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

  text = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id)

  const { width, height } = extractDimensions(event);

  const {data, isLoading} = useProfile({
    pubkey,
  });

  const card = (
    <Card>
    <SmallCardContent>
      <div>
        <div className='d-flex justify-content-center align-items-center'>
            <div style={{ position: 'relative' }}>
              <Image 
                src={image || "/placeholder.svg"} 
                alt={text}
                width={width}
                height={height}
                className='rounded lg:rounded-lg' 
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: 'auto' }} 
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

export default QuickViewKind20NoteCard;