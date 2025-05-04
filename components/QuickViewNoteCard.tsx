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

interface NoteCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: any;
  linkToNote: boolean;
}

const QuickViewNoteCard: React.FC<NoteCardProps> = ({ pubkey, text, eventId, tags, event, linkToNote }) => {
  const userData = useProfileValue(pubkey);


  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  text = text.replaceAll('\n', ' ');
  const imageSrc = text.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const videoSrc = text.match(/https?:\/\/[^ ]*\.(mp4|webm|mov)/g);
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif|mp4|webm|mov|jpeg)/g, '');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;
  const encodedNoteId = nip19.noteEncode(event.id)

  const card = (
    <Card>
    <SmallCardContent>
      <div>
        <div className='d-flex justify-content-center align-items-center'>
          {imageSrc && imageSrc.length > 1 && !videoSrc ? (
            <div style={{ position: 'relative' }}>
              <div className="absolute top-2 right-2 w-7 h-7 lg:w-12 lg:h-12 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <StackIcon className='absolute w-7 h-7 lg:w-12 lg:h-12'/>
              </div>
              <img src={imageSrc[0]} className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: 'auto' }} alt={text} />
            </div>
          ) : imageSrc && imageSrc.length > 0 ? (
            <div style={{ position: 'relative' }}>
              {videoSrc && videoSrc.length > 0 && 
                <div className="absolute top-2 right-2 w-7 h-7 lg:w-12 lg:h-12 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <PlayIcon className='absolute w-7 h-7 lg:w-12 lg:h-12' />
                </div>
              }
              <img src={imageSrc[0]} className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: 'auto' }} alt={text} />
            </div>
          ) : videoSrc && videoSrc.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <div className="absolute top-2 right-2 w-7 h-7 lg:w-12 lg:h-12 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <PlayIcon className='absolute w-7 h-7 lg:w-12 lg:h-12' />
              </div>
              <video src={videoSrc[0] + "#t=0.5"} className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: 'auto' }} />
            </div>
          ) : null}
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

export default QuickViewNoteCard;