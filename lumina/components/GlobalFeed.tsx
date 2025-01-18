import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

const GlobalFeed: React.FC = () => {
  const { events } = useNostrEvents({
    filter: {
      limit: 100,
      kinds: [20],
    },
  });

  return (
    <>
      <h2>Global Feed</h2>
      {events.map((event) => {
        const imageUrl = getImageUrl(event.tags);
        return (
          <div key={event.id} className="py-6">
            <KIND20Card 
              key={event.id} 
              pubkey={event.pubkey} 
              text={event.content} 
              image={imageUrl} 
              eventId={event.id} 
              tags={event.tags} 
              event={event} 
              showViewNoteCardButton={true} 
            />
          </div>
        );
      })}
    </>
  );
}

export default GlobalFeed;

