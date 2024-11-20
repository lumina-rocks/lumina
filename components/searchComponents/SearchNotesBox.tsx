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

interface SearchNotesBoxProps {
  searchTag: string;
}

const SearchNotesBox: React.FC<SearchNotesBoxProps> = ({ searchTag }) => {
  const { events: notes } = useNostrEvents({
    filter: {
      kinds: [1],
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
            {notes.map((event: NostrEvent) => (
              <NoteCard event={event} eventId={event.id} pubkey={event.pubkey} showViewNoteCardButton={true} tags={event.tags} text={event.content} key={event.id} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default SearchNotesBox;