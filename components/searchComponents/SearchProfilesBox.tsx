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

interface SearchProfilesBoxProps {
  searchTag: string;
}

const SearchProfilesBox: React.FC<SearchProfilesBoxProps> = ({ searchTag }) => {
  const { events: profiles } = useNostrEvents({
    filter: {
      kinds: [0],
      search: searchTag,
      limit: 10,
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          Profiles
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {profiles.map((event: NostrEvent) => (
              <ProfileInfoCard key={event.id} pubkey={event.pubkey} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default SearchProfilesBox;