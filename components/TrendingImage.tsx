import React, { useMemo } from 'react';
import { nip19 } from "nostr-tools";
import {
  Card,
  CardHeader,
  CardTitle,
  SmallCardContent,
} from "@/components/ui/card"
import Link from 'next/link';
import { Avatar } from './ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { useProfile, useNostrEvents } from '@/hooks/useNDK';

interface TrendingImageProps {
  eventId: string;
  pubkey: string;
}

const TrendingImage: React.FC<TrendingImageProps> = ({ eventId, pubkey }) => {
  const { data: userData } = useProfile(pubkey);

  const { events } = useNostrEvents({
    filter: {
      kinds: [1],
      ids: [eventId]
    },
  });

  const npubShortened = useMemo(() => {
    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    return 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
  }, [pubkey]);

  const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || npubShortened;
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.image || "https://robohash.org/" + pubkey;

  if (events.length === 0) return null;

  const event = events[0];
  const imageSrc = event.content.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g)?.[0];
  if (!imageSrc) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
          <Link href={hrefProfile} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar>
                <AvatarImage src={profileImageSrc} alt={title} />
              </Avatar>
              <span style={{ marginLeft: '10px' }}>{title}</span>
            </div>
          </Link>
        </CardTitle>
      </CardHeader>
      <SmallCardContent>
        <Link href={`/note/${nip19.noteEncode(eventId)}`}>
          <img 
            src={imageSrc} 
            className='rounded lg:rounded-lg'
            style={{ 
              width: '100%', 
              height: '200px',
              objectFit: 'cover'
            }} 
            alt={`Trending post by ${title}`} 
          />
        </Link>
      </SmallCardContent>
    </Card>
  );
}

export default TrendingImage;