import { useRef, useState } from "react";
import { useNostrEvents } from "@/hooks/useNDK";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import { Button } from "@/components/ui/button";

interface FollowerFeedProps {
  pubkey: string;
}

const FollowerFeed: React.FC<FollowerFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(20);

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
      limit: limit,
      kinds: [20],
      authors: followingPubkeys,
    },
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 20);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length === 0 && isLoading ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : events.some(event => getImageUrl(event.tags)) ? (
          <>
            {events.map((event) => {
              const imageUrl = getImageUrl(event.tags);
              return imageUrl ? (
                <KIND20Card
                  key={event.id}
                  pubkey={event.pubkey}
                  text={event.content}
                  image={imageUrl}
                  event={event.rawEvent()}
                  tags={event.tags}
                  eventId={event.id}
                  showViewNoteCardButton={true}
                />
              ) : null;
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500"></div>
            <p className="text-lg">No posts found :(</p>
          </div>
        )}
      </div>
      {!isLoading && events.some(event => getImageUrl(event.tags)) ? (
        <div className="flex justify-center p-4"></div>
          <Button className="w-full" onClick={loadMore}>Load More</Button>
        </div>
      ) : null}
    </>
  );
}

export default FollowerFeed;