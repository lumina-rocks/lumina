import React from 'react';
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
import Link from 'next/link';
import { Event as NostrEvent } from "nostr-tools";
import ProfileInfoCard from '../ProfileInfoCard';
import NoteCard from '../NoteCard';
import KIND20Card from '../KIND20Card';
import { getImageUrl } from '@/utils/utils';

// Function to extract video URL from imeta tags
const getVideoUrl = (tags: string[][]): string | null => {
  for (const tag of tags) {
    if (tag[0] === 'imeta') {
      for (let i = 1; i < tag.length; i++) {
        if (tag[i].startsWith('url ')) {
          return tag[i].substring(4);
        }
      }
    }
  }
  return null;
};

interface SearchNotesBoxProps {
  searchTag: string;
}

const SearchNotesBox: React.FC<SearchNotesBoxProps> = ({ searchTag }) => {
  const { events: notes } = useNostrEvents({
    filter: {
      kinds: [1, 20, 21, 22],
      search: searchTag,
      limit: 10,
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          Notes
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {notes.map((event: NostrEvent) => {
              const imageUrl = getImageUrl(event.tags);
              const isVideo = event.kind === 21 || event.kind === 22;
              
              if (event.kind === 1) {
                return (
                  <NoteCard event={event} eventId={event.id} pubkey={event.pubkey} showViewNoteCardButton={true} tags={event.tags} text={event.content} key={event.id} />
                );
              } else if (isVideo) {
                // Use NoteCard for video content
                const videoUrl = getVideoUrl(event.tags);
                const contentWithVideo = videoUrl ? `${event.content}\n${videoUrl}` : event.content;
                return (
                  <NoteCard
                    key={event.id}
                    pubkey={event.pubkey}
                    text={contentWithVideo}
                    eventId={event.id}
                    tags={event.tags}
                    event={event}
                    showViewNoteCardButton={true}
                  />
                );
              } else if (event.kind === 20) {
                return (
                  <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={imageUrl} event={event} tags={event.tags} eventId={event.id} showViewNoteCardButton={true}/>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default SearchNotesBox;