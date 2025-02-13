import { useRef } from "react";
import { useNostrEvents } from "@/hooks/useNDK";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface TagFeedProps {
  tag: string;
}

const TagFeed: React.FC<TagFeedProps> = ({tag}) => {
  const now = useRef(new Date());

  const { events } = useNostrEvents({
    filter: {
      kinds: [20],
      "#t": [tag],
      since: Math.floor(now.current.getTime() / 1000) - 7 * 24 * 60 * 60, // Last week
    },
  });

  return (
    <>
      <h2>Tag Feed for {tag}</h2>
      {events.map((event) => (
        <div key={event.id} className="py-6">
          <KIND20Card
            key={event.id}
            pubkey={event.pubkey}
            text={event.content}
            image={getImageUrl(event.tags)}
            eventId={event.id}
            tags={event.tags}
            event={event.rawEvent()}
            showViewNoteCardButton={true}
          />
        </div>
      ))}
    </>
  );
}

export default TagFeed;