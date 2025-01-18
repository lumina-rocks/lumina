import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from './NoteCard';
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface FollowerFeedProps {
  pubkey: string;
}

const FollowerFeed: React.FC<FollowerFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());

  const { events: following, isLoading: followingLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [pubkey],
      limit: 1,
    },
  });

  let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 500);

  const { events } = useNostrEvents({
    filter: {
      limit: 20,
      kinds: [20],
      authors: followingPubkeys,
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-4">
      {events.map((event) => (
        <div key={event.id} className="mb-4 md:mb-6">
          <KIND20Card 
            key={event.id} 
            pubkey={event.pubkey} 
            text={event.content} 
            image={getImageUrl(event.tags)} 
            eventId={event.id} 
            tags={event.tags} 
            event={event} 
            showViewNoteCardButton={true} 
          />
        </div>
      ))}
    </div>
  );
}

export default FollowerFeed;