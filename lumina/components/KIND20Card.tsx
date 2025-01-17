import React from 'react';
import { useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
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
import { Event as NostrEvent } from "nostr-tools";
import ZapButton from './ZapButton';

interface KIND20CardProps {
  pubkey: string;
  text: string;
  image: string;
  eventId: string;
  tags: string[][];
  event: NostrEvent;
  showViewNoteCardButton: boolean;
}

const KIND20Card: React.FC<KIND20CardProps> = ({ pubkey, text, image, eventId, tags, event, showViewNoteCardButton }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  text = text.replaceAll('\n', ' ');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

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
          <div className='py-4'>
            <div className='w-full h-full px-10'>
              {image && (
                <img
                  src={image}
                  className='rounded lg:rounded-lg'
                  style={{ maxWidth: '100%', maxHeight: '66vh', objectFit: 'contain', margin: 'auto' }}
                />
              )}
            </div>
            <br />
            <div className='break-word overflow-hidden'>
              {text}
            </div>
          </div>
          <hr />
          <div className='py-4 space-x-4 flex justify-between items-start'>
            <div className='flex space-x-4'>
              <ReactionButton event={event} />
              <ZapButton event={event} />
              {showViewNoteCardButton && <ViewNoteButton event={event} />}
            </div>
            <div className='flex space-x-2'>
              <ViewCopyButton event={event} />
              <ViewRawButton event={event} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <small className="text-muted">{createdAt.toLocaleString()}</small>
        </CardFooter>
      </Card>
    </>
  );
}

export default KIND20Card;