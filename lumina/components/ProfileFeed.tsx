import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import { Skeleton } from "@/components/ui/skeleton";

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
      kinds: [1],
    },
  });

  let filteredEvents = events.filter((event) => event.content.match(/https?:\/\/.*\.(?:png|jpg|gif)/g)?.[0]);
  // filter out all replies (tag[0] == e)
  filteredEvents = filteredEvents.filter((event) => !event.tags.some((tag) => { return tag[0] == 'e' }));

  return (
    <>
      {/* <h2>Profile Feed</h2> */}

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (filteredEvents.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        // <ProfileNoteCard key={event.id} pubkey={event.pubkey} text={event.content} event={event} tags={event.tags} />
        <div key={event.id} className="py-6">
          <NoteCard key={event.id} pubkey={event.pubkey} text={event.content} event={event} tags={event.tags} eventId={event.id} />
        </div>
      )))}
    </>
  );
}

export default ProfileFeed;