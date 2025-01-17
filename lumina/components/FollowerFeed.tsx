import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from './NoteCard';
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface FollowerFeedProps {
  pubkey: string;
}

const FollowerFeed: React.FC<FollowerFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events: following, isLoading: followingLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [pubkey],
      limit: 1,
    },
  });
  // let followingPubkeys = following.map((event) => event.tags[event.tags.length - 1][1]);
  // let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 50);
  let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 500);

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: 1000,
      kinds: [20],
      authors: followingPubkeys,
    },
  });

  return (
    <>
      {events.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        <div key={event.id} className="py-6">
          <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={true} />
        </div>
      ))}
    </>
  );
}

export default FollowerFeed;