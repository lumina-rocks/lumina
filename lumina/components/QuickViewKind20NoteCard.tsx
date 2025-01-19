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
import { extractDimensions, getBlurhashFromTags } from '@/utils/utils';
import { Blurhash } from "react-blurhash";

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
  const [imageLoaded, setImageLoaded] = useState(false);

  text = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id)

  const { width, height } = extractDimensions(event);

  const card = (
    <Card>
      <SmallCardContent>
        <div>
          <div className='d-flex justify-content-center align-items-center'>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {!imageLoaded && (
                <Blurhash
                  hash={getBlurhashFromTags(tags) || 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
                  width={width}
                  height={height}
                  resolutionX={32}
                  resolutionY={32}
                  punch={1}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
              <Image 
                src={image || "/placeholder.svg"} 
                alt={text}
                width={width}
                height={height}
                className='rounded lg:rounded-lg' 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '75vh', 
                  objectFit: 'contain', 
                  margin: 'auto',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                }}
                onLoad={() => setImageLoaded(true)}
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

export default QuickViewKind20NoteCard;