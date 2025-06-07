import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

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

  // Check if the event has nsfw or sexy tags
  const hasNsfwTag = event.tags.some(tag => 
    (tag[0] === 't' && (tag[1]?.toLowerCase() === 'nsfw' || tag[1]?.toLowerCase() === 'sexy')) ||
    (tag[0] === 'content-warning')
  );
  
  // State to control image blur
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);

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

  const hrefProfile = `/profile/${nip19.npubEncode(event.pubkey)}`;
  const hrefNote = `/note/${nip19.noteEncode(event.id)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + event.pubkey;

  // Toggle sensitive content visibility
  const toggleSensitiveContent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSensitiveContent(!showSensitiveContent);
  };

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
            {imageUrl && (
              <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <Link href={hrefNote} onClick={hasNsfwTag && !showSensitiveContent ? (e) => e.preventDefault() : undefined}>
                  <img 
                    src={imageUrl} 
                    className={`rounded lg:rounded-lg w-full h-full object-cover ${hasNsfwTag && !showSensitiveContent ? 'blur-xl' : ''}`}
                    style={{ margin: 'auto' }} 
                    alt={text}
                    loading="lazy"
                  />
                  {hasNsfwTag && !showSensitiveContent && (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      onClick={toggleSensitiveContent}
                    >
                      <Button 
                        variant="secondary" 
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-md"
                        onClick={toggleSensitiveContent}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Show Sensitive Content
                      </Button>
                      <p className="mt-2 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
                        This image may contain sensitive content
                      </p>
                    </div>
                  )}
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