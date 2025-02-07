import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const GlobalFeed: React.FC = () => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(20);

  const { events, isLoading } = useNostrEvents({
    filter: {
      limit: limit,
      kinds: [20],
    },
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 20);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 px-2 md:px-4">Global Feed</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-4">
        {events.map((event) => {
          const imageUrl = getImageUrl(event.tags);
          return (
            <div key={event.id} className="mb-4 md:mb-6">
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
      </div>
      {!isLoading && (
        <div className="flex justify-center p-4">
          <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default GlobalFeed;