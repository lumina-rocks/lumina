import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from './NoteCard';
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface TagFeedProps {
  tag: string;
}

const TagFeed: React.FC<TagFeedProps> = ({tag}) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      // limit: 100,
      kinds: [20],
      "#t": [tag],
    },
  });

  return (
    <>
      <h2>Tag Feed for {tag}</h2>
      {events.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        <div key={event.id} className="py-6">
          <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={true} />
        </div>
      ))}
    </>
  );
}

export default TagFeed;