import { useRef, useState, useEffect } from "react";
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
  const [retryCount, setRetryCount] = useState(0);

  const { events: following, isLoading: followingLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [pubkey],
      limit: 1,
    },
  });

  // Add retry mechanism for following list loading
  useEffect(() => {
    // If following list is empty and we haven't exceeded max retries
    if (following.length === 0 && !followingLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 2000); // Retry after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [following, followingLoading, retryCount]);

  let followingPubkeys = following.flatMap((event) => 
    event.tags
      .filter(tag => tag[0] === 'p')
      .map(tag => tag[1])
  );
  
  const { events, isLoading } = useNostrEvents({
    filter: {
      limit: limit,
      kinds: [20],
      authors: followingPubkeys.length > 0 ? followingPubkeys : [pubkey], // fallback to user's own posts if following list is empty
    },
    enabled: followingPubkeys.length > 0 || retryCount >= 3, // only run query when we have pubkeys or after max retries
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 20);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-4">
        {isLoading && events.length === 0 ? (
          // Show loading placeholder
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="mb-4 md:mb-6">
              <div className="animate-pulse my-4">
                <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-1/2"></div>
              </div>
            </div>
          ))
        ) : events.length > 0 ? (
          // Show actual events
          events.map((event) => (
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
          ))
        ) : followingPubkeys.length === 0 && retryCount >= 3 ? (
          // If no following and max retries reached
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
            <p className="text-lg">No follows found. Follow some users to see their posts here.</p>
          </div>
        ) : (
          // If following exists but no posts found
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
            <p className="text-lg">No posts found from people you follow.</p>
          </div>
        )}
      </div>
      {!isLoading && events.length > 0 && (
        <div className="flex justify-center p-4">
          <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default FollowerFeed;