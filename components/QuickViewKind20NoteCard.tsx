import React, { useState } from 'react';
import { useProfile } from "@/hooks/useNDK";
import { nip19 } from "nostr-tools";
import {
  Card,
  SmallCardContent,
} from "@/components/ui/card"
import Link from 'next/link';
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

const QuickViewKind20NoteCard: React.FC<QuickViewKind20NoteCardProps> = ({ 
  pubkey, 
  text, 
  image, 
  eventId, 
  tags, 
  event, 
  linkToNote 
}) => {
  const { data: userData } = useProfile(pubkey);
  const [imageError, setImageError] = useState(false);

  if (!image || imageError) return null;

  text = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id);
  const { width, height } = extractDimensions(event);

  const card = (
    <Card className="aspect-square">
      <SmallCardContent className="h-full p-0">
        <img 
          src={image} 
          className='rounded lg:rounded-lg'
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover'
          }} 
          alt={text}
          onError={() => setImageError(true)}
        />
      </SmallCardContent>
    </Card>
  );

  if (linkToNote) {
    return (
      <Link href={'/note/' + encodedNoteId}>
        {card}
      </Link>
    );
  }

  return card;
}

export default QuickViewKind20NoteCard;