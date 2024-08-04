import React, { useState } from 'react';
import { useNostrEvents, useProfile } from "nostr-react";
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

interface GenerateNoteImageComponentProps {
  noteId: string;
}

const GenerateNoteImageComponent: React.FC<GenerateNoteImageComponentProps> = ({ noteId }) => {

  let text = ''
  let imageUrl
  let finalImage: string | undefined

  const { events: notes } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      ids: [noteId.toString()],
      limit: 1,
      kinds: [1],
    },
  });

  console.log("id:", noteId);
  console.log("noteEvents:", notes);

  console.log("noteEvents[0]:", notes[0].content);
  // text = notes[0].content;
  // pubkey = notes[0].pubkey;

  // -----

  // const { events: profile } = useNostrEvents({
  //   filter: {
  //     // since: dateToUnix(now.current), // all new events from now
  //     // since: 0,
  //     authors: [noteId.toString()],
  //     limit: 1,
  //     kinds: [0],
  //   },
  // });
  // // imageUrl = profile?.picture

  // console.log("profile:", profile);

  // // -------------


  // if (!imageUrl) return;

  // const canvas = document.createElement('canvas');
  // const context = canvas?.getContext('2d');
  // const img = new Image();
  // img.crossOrigin = 'anonymous';
  // img.src = imageUrl;

  // img.onload = () => {
  //   canvas.width = img.width;
  //   canvas.height = img.height;
  //   if (context) {
  //     context.drawImage(img, 0, 0);
  //     context.font = '40px Arial';
  //     context.fillStyle = 'white';
  //     context.fillText(text, 50, 50);
  //     const dataUrl = canvas.toDataURL('image/png');
  //     finalImage = (dataUrl);
  //   }
  // };

  // img.onerror = () => {
  //   console.error("Fehler beim Laden des Bildes.");
  // };

  // const handleDownloadImage = () => {
  //   if (!finalImage) return;

  //   const link = document.createElement('a');
  //   link.href = finalImage;
  //   link.download = 'generated-image.png';
  //   link.click();
  // };

  // const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);

  return (
    <>
      <div>
        {/* {finalImage && (
          <>
            <img src={finalImage} alt="Generated" />
            <button onClick={handleDownloadImage}>Download Image</button>
          </>
        )} */}
      </div>
    </>
  );
}

export default GenerateNoteImageComponent;