import React from 'react';
import { nip19 } from "nostr-tools";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import ReactionButton from '@/components/ReactionButton';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import ViewRawButton from '@/components/ViewRawButton';
import ViewNoteButton from './ViewNoteButton';
import Link from 'next/link';
import ViewCopyButton from './ViewCopyButton';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import ZapButton from './ZapButton';
import { useProfile } from '@/hooks/useNDK';

interface NoteCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: any;
  showViewNoteCardButton?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ pubkey, text, eventId, tags, event, showViewNoteCardButton }) => {
  const { data: userData } = useProfile(pubkey);

  const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || nip19.npubEncode(pubkey);
  text = text.replaceAll('\n', ' ');
  const imageSrc = text.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const videoSrc = text.match(/https?:\/\/[^ ]*\.(mp4|webm|mov)/g);
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif|mp4|webm|mov|jpeg)/g, '');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.image || "https://robohash.org/" + pubkey;
  const uploadedVia = tags.find((tag) => tag[0] === "client")?.[1];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Link href={hrefProfile} style={{ textDecoration: 'none' }}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar>
                        <AvatarImage src={profileImageSrc} />
                      </Avatar>
                      <span className='break-all' style={{ marginLeft: '10px' }}>{title}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {textWithoutImage && <p className='break-words whitespace-pre-wrap'>{textWithoutImage}</p>}
            {imageSrc && imageSrc.length > 0 && (
              <Carousel>
                <CarouselContent>
                  {imageSrc.map((image, index) => (
                    <CarouselItem key={index}>
                      <img src={image} className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', margin: 'auto' }} alt={`Image ${index + 1}`} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
            {videoSrc && videoSrc.length > 0 && (
              <Carousel>
                <CarouselContent>
                  {videoSrc.map((video, index) => (
                    <CarouselItem key={index}>
                      <video className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '75vh', margin: 'auto' }} controls>
                        <source src={video} />
                      </video>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
          </div>
          <hr className="my-4" />
          <div className="space-x-4 flex justify-between items-start">
            <div className="flex space-x-4">
              <ReactionButton event={event} />
              <ZapButton event={event} />
              {showViewNoteCardButton && <ViewNoteButton event={event} />}
            </div>
            <div className="flex space-x-2">
              <ViewCopyButton event={event} />
              <ViewRawButton event={event} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-1">
            <small className="text-muted">{createdAt.toLocaleString()}</small>
            {uploadedVia && <small className="text-muted">Uploaded via {uploadedVia}</small>}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

export default NoteCard;