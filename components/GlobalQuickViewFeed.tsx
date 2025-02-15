import { useRef, useState } from "react";
import { useNostrEvents } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl } from "@/utils/utils";

const GlobalQuickViewFeed: React.FC = () => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(25);

  const { events, isLoading } = useNostrEvents({
    filter: {
      limit: limit,
      kinds: [20],
      since: Math.floor((now.current.getTime() - 24 * 60 * 60 * 1000) / 1000), // Last 24 hours
    },
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 25);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {events.length === 0 && isLoading ? (
          <>
            <div>
              <Skeleton className="h-[33vh] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[33vh] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[33vh] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[33vh] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[33vh] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[33vh] rounded-xl" />
            </div>
          </>
        ) : (
          events.map((event) => (
            <QuickViewKind20NoteCard
              key={event.id}
              pubkey={event.pubkey}
              text={event.content}
              image={getImageUrl(event.tags)}
              event={event}
              tags={event.tags}
              eventId={event.id}
              linkToNote={true}
            />
          ))
        )}
      </div>
      {!isLoading && (
        <div className="flex justify-center p-4">
          <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default GlobalQuickViewFeed;