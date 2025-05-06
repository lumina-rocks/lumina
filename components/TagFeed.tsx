import { useRef, useState } from "react";
import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TagFeedProps {
  tag: string;
}

const TagFeed: React.FC<TagFeedProps> = ({ tag }) => {
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
      <div className="grid lg:grid-cols-3 gap-2">
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
              <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={true} />
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

export default TagFeed;