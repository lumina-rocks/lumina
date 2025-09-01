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
  isVideo?: boolean;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ pubkey, eventId, imageUrl, linkToNote, isVideo = false }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

  // Check if the URL is a video file (for cases where we don't have a thumbnail image)
  const isVideoFile = imageUrl.match(/\.(mp4|webm|mov|avi|mkv)$/i);
  
  // For gallery view, we want to show thumbnails for videos
  // Use the isVideo prop or detect from file extension, or force for .mp4 files
  const isVideoThumbnail = isVideo || isVideoFile || imageUrl.includes('.mp4');
  
  // Debug logging
  console.log('GalleryCard render:', {
    imageUrl,
    isVideo,
    isVideoFile: !!isVideoFile,
    isVideoThumbnail,
    eventId
  });

      // Create neevent with relay hints
    const nevent = nip19.neventEncode({
        id: eventId,
        relays: [] // Add relay hints if available
    });

  const card = (
    <Card>
      <SmallCardContent>
        <div>
          <div className='d-flex justify-content-center align-items-center'>
            <div style={{ position: 'relative' }}>
              {isVideoThumbnail ? (
                <>
                  {isVideoFile ? (
                    // If it's a video file URL, show a placeholder with play icon
                    <div 
                      className='rounded lg:rounded-lg w-full h-full object-cover bg-gray-800 flex items-center justify-center' 
                      style={{ maxHeight: '75vh', margin: 'auto', aspectRatio: '16/9' }} 
                    >
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PlayIcon style={{ color: 'white', width: '20px', height: '20px' }} />
                      </div>
                    </div>
                  ) : (
                    // If it's an image URL, show the image with play icon overlay
                    <>
                      <img 
                        src={imageUrl} 
                        className='rounded lg:rounded-lg w-full h-full object-cover' 
                        style={{ maxHeight: '75vh', margin: 'auto' }} 
                        alt={eventId}
                        loading="lazy"
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PlayIcon style={{ color: 'white', width: '20px', height: '20px' }} />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <img 
                  src={imageUrl} 
                  className='rounded lg:rounded-lg w-full h-full object-cover' 
                  style={{ maxHeight: '75vh', margin: 'auto' }} 
                  alt={eventId}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );

  return (
    <>
      {linkToNote ? (
        <Link href={`/note/${nevent}`}>
          {card}
        </Link>
      ) : (
        card
      )}
    </>
  );
}

export default GalleryCard;