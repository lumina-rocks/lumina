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
import { extractDimensions, getChecksumSha256 } from '@/utils/utils';

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

const QuickViewKind20NoteCard: React.FC<QuickViewKind20NoteCardProps> = async ({ pubkey, text, image, eventId, tags, event, linkToNote }) => {


  const { createHash } = require("crypto")

  const {data, isLoading} = useProfile({
    pubkey,
  });
  const [imageError, setImageError] = useState(false);

  if (!image || !image.startsWith("http") || imageError) return null;

  // get hash of the image from event tags
  const eventImageHash = tags.find((tag) => tag[0] === "x")?.[1];
  // get blob from the image url
  const response = await fetch(image);
  const blob = await response.blob();
  const sha256 = await getChecksumSha256(blob);
  // console.log("Event X Hash: ", eventImageHash);
  // console.log("Image Hash: ", sha256);
  // console.log("===============");

  text = text.replaceAll('\n', ' ');
  const encodedNoteId = nip19.noteEncode(event.id)

  const { width, height } = extractDimensions(event);

  const card = (
    <Card className="aspect-square">
      <SmallCardContent className="h-full p-0">
        <div className="h-full w-full">
          <div className='relative w-full h-full'>
            <Image 
              src={image || "/placeholder.svg"} 
              alt={text}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className='rounded lg:rounded-lg object-cover' 
              priority
              onError={() => setImageError(true)}
            />
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