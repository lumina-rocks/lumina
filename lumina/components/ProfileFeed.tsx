import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import { Skeleton } from "@/components/ui/skeleton";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface ProfileFeedProps {
  pubkey: string;
}

const ProfileFeed: React.FC<ProfileFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      authors: [pubkey],
      // since: 0,
      // limit: 10,
      kinds: [20],
    },
  });

  return (
    <>
      {/* <h2>Profile Feed</h2> */}

      {events.length === 0 ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (events.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        // <ProfileNoteCard key={event.id} pubkey={event.pubkey} text={event.content} event={event} tags={event.tags} />
        <div key={event.id} className="py-6">
          <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} event={event} tags={event.tags} eventId={event.id} showViewNoteCardButton={true}/>
        </div>
      )))}
    </>
  );
}

export default ProfileFeed;