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
import Link from 'next/link';
import { useProfile } from '@/hooks/useNDK';

interface CommentCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: any;
}

const CommentCard: React.FC<CommentCardProps> = ({ pubkey, text, eventId, tags, event }) => {
  const { data: userData } = useProfile(pubkey);

  const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || nip19.npubEncode(pubkey);
  const imageSrc = text.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg)/g);
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif|jpeg)/g, '');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.image || "https://robohash.org/" + pubkey;

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
          <div className="space-y-2">
            <p className='break-words whitespace-pre-wrap'>{textWithoutImage}</p>
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
          </div>
          <hr className="my-4" />
          <div className="flex justify-between items-start">
            <ReactionButton event={event} />
            <div>
              <ViewRawButton event={event} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <small className="text-muted-foreground">
            {createdAt.toLocaleString()}
          </small>
        </CardFooter>
      </Card>
    </>
  );
}

export default CommentCard;