import { useRef } from "react";
import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface TagFeedProps {
  tag: string;
}

const TagFeed: React.FC<TagFeedProps> = ({ tag }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: 100,
      kinds: [20],
      "#t": [tag],
    },
  });

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-2">
        {events.map((event) => (
          // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
          <div key={event.id}>
            <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={true} />
          </div>
        ))}
      </div>
    </>
  );
}

export default TagFeed;