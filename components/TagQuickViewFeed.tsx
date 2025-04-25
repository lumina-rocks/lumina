import { useRef } from "react";
import { useNostrEvents } from "nostr-react";
import { getImageUrl } from "@/utils/utils";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";

interface TagQuickViewFeedProps {
  tag: string;
}

const TagQuickViewFeed: React.FC<TagQuickViewFeedProps> = ({ tag }) => {
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
      <div className="grid grid-cols-3 gap-2">
        {events.map((event) => (
          // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
          <div key={event.id}>
            <QuickViewKind20NoteCard pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} eventId={event.id} tags={event.tags} event={event} linkToNote={false} />
          </div>
        ))}
      </div>
    </>
  );
}

export default TagQuickViewFeed;