import { useRef, useState } from "react";
import { useNostrEvents } from "nostr-react";
import { getImageUrl } from "@/utils/utils";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TagQuickViewFeedProps {
  tag: string;
}

const TagQuickViewFeed: React.FC<TagQuickViewFeedProps> = ({ tag }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered
  const [limit, setLimit] = useState(25);

  const { events, isLoading } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: limit,
      kinds: [20],
      "#t": [tag],
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
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </>
        ) : (
          events.map((event) => (
            <div key={event.id}>
              <QuickViewKind20NoteCard pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} eventId={event.id} tags={event.tags} event={event} linkToNote={false} />
            </div>
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

export default TagQuickViewFeed;