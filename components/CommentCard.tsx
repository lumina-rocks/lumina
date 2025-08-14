import React from 'react';
import { useProfile, useNostrEvents } from "nostr-react";
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

interface CommentCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: any;
}

const NoteCard: React.FC<CommentCardProps> = ({ pubkey, text, eventId, tags, event }) => {
  const { data: userData } = useProfile({
    pubkey,
  });
  
  // Fetch comments related to this event
  const { events: commentEvents } = useNostrEvents({
    filter: {
      kinds: [1],
      '#e': [eventId],
    },
  });

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  const imageSrc = text.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif|jpeg)/g, '');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Link href={hrefProfile} style={{ textDecoration: 'none'}}>
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
            {
              <div className='w-full h-full px-10'>
                {imageSrc && imageSrc.length > 1 ? (
                  <Carousel>
                    <CarouselContent>
                      {imageSrc.map((src, index) => (
                        <CarouselItem key={index}>
                          <img
                            key={index}
                            src={src}
                            className='rounded lg:rounded-lg'
                            style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain', margin: 'auto' }}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  imageSrc ? <img src={imageSrc[0]} className='rounded lg:rounded-lg' style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain', margin: 'auto' }} /> : ""
                )}
              </div>
            }
            <br />
            <div className='break-word overflow-hidden'>
              {textWithoutImage}
            </div>
          </div>
          <hr />
          <div className='py-4 space-x-4 flex justify-between items-start'>
            <div className='flex space-x-4'>
              <ReactionButton event={event} />
            </div>
            <ViewRawButton event={event} />
          </div>
          
          {/* Comments section */}
          {commentEvents && commentEvents.length > 0 && (
            <div className="mt-4">
              {/* <h3 className="text-lg font-medium mb-2">Comments ({commentEvents.length})</h3> */}
              <div className="space-y-3">
                {commentEvents.map((commentEvent) => (
                  // <div key={commentEvent.id} className="border p-3 rounded-md">
                  //   <div className="flex items-center mb-2">
                  //     <span className="text-sm font-medium">
                  //       {nip19.npubEncode(commentEvent.pubkey).substring(0, 10)}...
                  //     </span>
                  //     <span className="text-xs ml-2 text-gray-500">
                  //       {new Date(commentEvent.created_at * 1000).toLocaleString()}
                  //     </span>
                  //   </div>
                  //   <p className="text-sm">{commentEvent.content}</p>
                  // </div>
                  <NoteCard key={commentEvent.id} pubkey={commentEvent.pubkey} text={commentEvent.content} eventId={commentEvent.id} tags={commentEvent.tags} event={commentEvent} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <small className="text-muted">{createdAt.toLocaleString()}</small>
        </CardFooter>
      </Card>
    </>
  );
}

export default NoteCard;