import React, { useState, useEffect } from 'react';
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
import { extractDimensions, getChecksumSha256 } from '@/utils/utils';
import { CheckCircle, XCircle } from 'lucide-react'; // Import icons for verification status

interface QuickViewKind20NoteCardProps {
  pubkey: string;
  text: string;
  image: string;
  eventId: string;
  tags: string[][];
  event: any;
  linkToNote: boolean;
}

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

const QuickViewKind20NoteCard: React.FC<QuickViewKind20NoteCardProps> = ({ pubkey, text, image, eventId, tags, event, linkToNote }) => {
  const [imageError, setImageError] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Skip verification if there's no valid image
    if (!image || !image.startsWith("http") || imageError) return;
    
    const verifyImage = async () => {
      try {
        // get hash of the image from event tags
        let eventImageHash = tags.find((tag) => tag[0] === "x")?.[1];
        
        if(!eventImageHash) {
          eventImageHash = tags.find((tag) => tag[0] === "imeta")?.find(tag => tag.startsWith("x"))?.split(" ")[1];
        }

        if (eventImageHash) {
          // get blob from the image url
          const response = await fetch(image);
          const blob = await response.blob();
          const sha256 = await getChecksumSha256(blob);
          
          // Determine verification status
          setVerificationStatus(eventImageHash === sha256);
        }
      } catch (error) {
        console.error("Error verifying image:", error);
        setVerificationStatus(null);
      }
    };
    
    verifyImage();
  }, [image, tags, imageError]);

  if (!image || !image.startsWith("http") || imageError) return null;
  
  const processedText = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id);

  const { width, height } = extractDimensions(event);

  const card = (
    <Card className="aspect-square">
      <SmallCardContent className="h-full p-0">
        <div className="h-full w-full">
          <div className='relative w-full h-full'>
            <Image 
              src={image || "/placeholder.svg"} 
              alt={processedText}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className='rounded lg:rounded-lg object-cover' 
              priority
              onError={() => setImageError(true)}
            />
            
            {/* Verification status indicator */}
            {verificationStatus !== null && (
              <div className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1">
                {verificationStatus ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>
      </SmallCardContent>
    </Card>
  );

  return (
    <>
      {linkToNote ? (
        <Link href={`/note/${encodedNoteId}`} className="block w-full aspect-square">
          {card}
        </Link>
      ) : (
        card
      )}
    </>
  );
}

export default QuickViewKind20NoteCard;