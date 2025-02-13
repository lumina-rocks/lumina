import { useRef, useState } from "react";
import { useNostrEvents } from "@/hooks/useNDK";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QuickViewNoteCard from "./QuickViewNoteCard";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl } from "@/utils/utils";

interface FollowerQuickViewFeedProps {
  pubkey: string;
}

const FollowerQuickViewFeed: React.FC<FollowerQuickViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(25);

  const { events: following } = useNostrEvents({
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
      kinds: [20],
      authors: followingPubkeys,
      limit,
      since: Math.floor(now.current.getTime() / 1000) - 7 * 24 * 60 * 60, // Last week
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
              <Skeleton className="h-[125px] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[125px] rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[125px] rounded-xl" />
            </div>
          </>
        ) : events.some(event => getImageUrl(event.tags)) ? (
          <>
            {events.map((event) => {
              const imageUrl = getImageUrl(event.tags);
              return imageUrl ? (
                <QuickViewKind20NoteCard
                  key={event.id}
                  pubkey={event.pubkey}
                  text={event.content}
                  image={imageUrl}
                  event={event.rawEvent()}
                  tags={event.tags}
                  eventId={event.id}
                  linkToNote={true}
                />
              ) : null;
            })}
          </>
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-10 text-gray-500">
            <p className="text-lg">No posts found :(</p>
          </div>
        )}
      </div>
      {!isLoading && events.some(event => getImageUrl(event.tags)) ? (
        <div className="flex justify-center p-4">
          <Button className="w-full" onClick={loadMore}>Load More</Button>
        </div>
      ) : null}
    </>
  );
}

export default FollowerQuickViewFeed;