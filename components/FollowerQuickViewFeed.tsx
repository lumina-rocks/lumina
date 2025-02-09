import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QuickViewNoteCard from "./QuickViewNoteCard";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl } from "@/utils/utils";

interface FollowerQuickViewFeedProps {
  pubkey: string;
}

const FollowerQuickViewFeed: React.FC<FollowerQuickViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered
  const [limit, setLimit] = useState(25);

  const { events: following, isLoading: followingLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [pubkey],
      limit: 1,
    },
  });

  let followingPubkeys = following.flatMap((event) => 
    event.tags
      .filter(tag => tag[0] === 'p')
      .map(tag => tag[1])
  );

  const { events, isLoading } = useNostrEvents({
    filter: {
      limit: limit,
      kinds: [20],
      authors: followingPubkeys,
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

export default FollowerQuickViewFeed;