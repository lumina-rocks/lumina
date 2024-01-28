import React from 'react';
// import Button from 'react-bootstrap/Button';
import { Button } from '@/components/ui/button';
import { useNostrEvents, useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ViewRawButton from '@/components/ViewRawButton';
import Image from 'next/image';

interface NoteCardProps {
  pubkey: string;
  text: string;
  eventId: string;
  tags: string[][];
  event: any;
}

const NoteCard: React.FC<NoteCardProps> = ({ pubkey, text, eventId, tags, event }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  // const imageSrc = text.match(/https?:\/\/.*\.(?:png|jpg|gif)/g)?.[0];
  const imageSrc = text.match(/https?:\/\/.*\.(?:png|jpg|gif)/g)?.[0].split(' ');
  const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif)/g, '');
  // const textWithoutImage = text.replace(/https?:\/\/.*\.(?:png|jpg|gif)(\?.*)?/g, '');
  const createdAt = new Date(event.created_at * 1000);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  // const profileImageSrc = userData?.picture || "https://via.placeholder.com/150";
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>
          <a href={hrefProfile} target='blank' style={{ textDecoration: 'none', color: 'white' }}>
            {/* <Avatar>
              <AvatarImage src={profileImageSrc} />
            </Avatar> */}
            {/* {title} */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar>
                    <AvatarImage src={profileImageSrc} />
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </a>
        </CardTitle>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className='py-4'>
          {
            // imageSrc ? imageSrc.map((src, index) => <img key={index} src={src} style={{ maxWidth: '100%' }} />) : ""
            <div className='d-flex justify-content-center align-items-center py-10 px-10'>
            {imageSrc && imageSrc.length > 1 ? (
              <Carousel>
                <CarouselContent>
                  {imageSrc.map((src, index) => (
                    <CarouselItem key={index}>
                      {/* <img
                        key={index}
                        src={src}
                        style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain', margin: 'auto'}}
                      /> */}
                      <Image
                        key={index}
                        src={src}
                        alt={textWithoutImage}
                        width={500}
                        height={500}
                        layout="responsive"
                        objectFit="contain" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              // imageSrc ? <img src={imageSrc[0]} style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain', margin: 'auto'}} /> : ""
              imageSrc ? <Image
                src={imageSrc[0]}
                alt={textWithoutImage}
                width={500}
                height={500}
                layout="responsive"
                objectFit="contain" /> : ""
            )}
          </div>
          }
          <br />
          {textWithoutImage}
        </div>
        <hr />
        <div className='py-4 space-x-4 flex justify-between'>
          <ReactionButton event={event} />
          <ViewRawButton event={event} />
        </div>
      </CardContent>
      <CardFooter>
        <small className="text-muted">{createdAt.toLocaleString()}</small>
      </CardFooter>
    </Card>
    </>
  );
}

export default NoteCard;