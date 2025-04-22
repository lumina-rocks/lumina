import React, { useMemo } from 'react';
import { useNostr, useNostrEvents, useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
import {
  Card,
  CardHeader,
  CardTitle,
  SmallCardContent,
} from "@/components/ui/card"
import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from './ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';

interface TrendingImageProps {
  eventId: string;
  pubkey: string;
}

const TrendingImage: React.FC<TrendingImageProps> = ({ eventId, pubkey }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

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

  let text = events && events.length > 0 ? events[0].content : '';
  const createdAt = events && events.length > 0 ? new Date(events[0].created_at * 1000) : new Date();
  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
  text = text.replaceAll('\n', ' ');
  const imageSrc = text.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif|jpeg)/g, '');
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const hrefNote = `/note/${nip19.noteEncode(eventId)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

  // Create proxied image URL
  const getProxiedImageUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return url;
    try {
      // Encode the URL to be used in the proxy
      const encodedUrl = encodeURIComponent(url);
      return `https://imgproxy.lumina.rocks/resize:fit:800:600/plain/${encodedUrl}`;
    } catch (error) {
      console.error("Error creating proxied image URL:", error);
      return url;
    }
  }

  const proxiedImageSrc = imageSrc && imageSrc.length > 0 ? getProxiedImageUrl(imageSrc[0]) : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar>
                <AvatarImage src={profileImageSrc} />
              </Avatar>
              <span className='break-all' style={{ marginLeft: '10px' }}>{title}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <SmallCardContent>
          <div className='p-2'>
            <div className='d-flex justify-content-center align-items-center'>
              {proxiedImageSrc && (
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                  <Link href={hrefNote}>
                    <img src={proxiedImageSrc} className='rounded lg:rounded-lg' style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={text} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SmallCardContent>
      </Card>
    </>
  );
}

export default TrendingImage;