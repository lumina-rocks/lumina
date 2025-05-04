import React from 'react';
import { useProfile } from "nostr-react";
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
import { getProxiedImageUrl } from '@/utils/utils';

interface TrendingImageNewProps {
  event: {
    id: string;
    pubkey: string;
    content: string;
    created_at: string;
    tags: Array<string[]>;
  }
}

const TrendingImageNew: React.FC<TrendingImageNewProps> = ({ event }) => {
  const { data: userData } = useProfile({
    pubkey: event.pubkey,
  });

  const npubShortened = (() => {
    let encoded = nip19.npubEncode(event.pubkey);
    let parts = encoded.split('npub');
    return 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
  })();

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
  const text = event.content.replaceAll('\n', ' ');
  
  // Get image URL from imeta tags
  const imageUrl = event.tags.find(tag => tag[0] === 'imeta' && tag[1]?.startsWith('url '))
    ?.slice(1)[0]?.replace('url ', '');

  const useImgProxy = process.env.NEXT_PUBLIC_ENABLE_IMGPROXY === "true";

  const proxiedImageUrl = useImgProxy && imageUrl ? getProxiedImageUrl(imageUrl, 800, 600) : imageUrl;
  const hrefProfile = `/profile/${nip19.npubEncode(event.pubkey)}`;
  const hrefNote = `/note/${nip19.noteEncode(event.id)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + event.pubkey;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={hrefProfile} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar>
                <AvatarImage src={profileImageSrc} />
              </Avatar>
              <span className='break-all' style={{ marginLeft: '10px' }}>{title}</span>
            </div>
          </Link>
        </CardTitle>
      </CardHeader>
      <SmallCardContent>
        <div className='p-2'>
          <div className='d-flex justify-content-center align-items-center'>
            {proxiedImageUrl && (
              <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <Link href={hrefNote}>
                  <img 
                    src={proxiedImageUrl} 
                    className='rounded lg:rounded-lg w-full h-full object-cover' 
                    style={{ margin: 'auto' }} 
                    alt={text}
                    loading="lazy"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );
}

export default TrendingImageNew;