import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSubscribe } from "@nostr-dev-kit/ndk-hooks";

const GlobalFeed: React.FC = () => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(20);

  // const { events, isLoading } = useNostrEvents({
  //   filter: {
  //     limit: limit,
  //     kinds: [20],
  //   },
  // });

  const events = useSubscribe(
    [
      {
        limit: limit,
        kinds: [20],
      }
    ],
    undefined,
    [limit]
  ).events;

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 20);
  };

  return (
    <>
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
      <div className="flex justify-center p-4">
        <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
      </div>
    </>
  );
}

export default GlobalFeed;