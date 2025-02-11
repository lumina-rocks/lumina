import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import { Button } from "@/components/ui/button";

interface FollowerFeedProps {
  pubkey: string;
}

const FollowerFeed: React.FC<FollowerFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(20);

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
    setLimit(prevLimit => prevLimit + 20);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-4">
        {events.map((event) => (
          <div key={event.id} className="mb-4 md:mb-6">
            <KIND20Card 
              key={event.id} 
              pubkey={event.pubkey} 
              text={event.content} 
              image={getImageUrl(event.tags)} 
              eventId={event.id} 
              tags={event.tags} 
              event={event} 
              showViewNoteCardButton={true} 
            />
          </div>
        ))}
      </div>
      {!isLoading && (
        <div className="flex justify-center p-4">
          <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default FollowerFeed;