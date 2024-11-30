import React from 'react';
import { useProfile } from "nostr-react";
import { nip19 } from "nostr-tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, SquareStackIcon as StackIcon, VideoIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from 'date-fns'

interface NoteCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: any;
  linkToNote: boolean;
}

const QuickViewNoteCard: React.FC<NoteCardProps> = ({ pubkey, text, eventId, tags, event, linkToNote }) => {
  const { data: userData } = useProfile({ pubkey });

  const username = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  const cleanText = text.replaceAll('\n', ' ');
  const imageSrc = cleanText.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const videoSrc = cleanText.match(/https?:\/\/[^ ]*\.(mp4|webm|mov)/g);
  const textWithoutMedia = cleanText.replace(/https?:\/\/.*\.(?:png|jpg|gif|mp4|webm|mov|jpeg)/g, '').trim();
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.picture || `https://robohash.org/${pubkey}`;
  const encodedNoteId = nip19.noteEncode(event.id);

  const MediaContent = () => (
    <div className="relative w-full aspect-video">
      {imageSrc && imageSrc.length > 1 && !videoSrc ? (
        <>
          <Image src={imageSrc[0]} layout="fill" objectFit="cover" className="rounded-md" alt={textWithoutMedia} />
          <div className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <StackIcon className="w-5 h-5 text-white" />
          </div>
        </>
      ) : imageSrc && imageSrc.length > 0 ? (
        <Image src={imageSrc[0]} layout="fill" objectFit="cover" className="rounded-md" alt={textWithoutMedia} />
      ) : videoSrc && videoSrc.length > 0 ? (
        <>
          <video src={`${videoSrc[0]}#t=0.5`} className="w-full h-full object-cover rounded-md" />
          <div className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <PlayIcon className="w-5 h-5 text-white" />
          </div>
        </>
      ) : null}
    </div>
  );

  const card = (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={profileImageSrc} alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-base">{username}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <MediaContent />
        {textWithoutMedia && (
          <p className="mt-4 text-sm line-clamp-3">{textWithoutMedia}</p>
        )}
      </CardContent>
    </Card>
  );

  return linkToNote ? (
    <Link href={`/note/${encodedNoteId}`} className="block hover:opacity-90 transition-opacity">
      {card}
    </Link>
  ) : (
    card
  );
}

export default QuickViewNoteCard;

