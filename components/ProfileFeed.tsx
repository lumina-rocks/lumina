import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface ProfileFeedProps {
  pubkey: string;
}

const ProfileFeed: React.FC<ProfileFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(10);

  const { events, isLoading } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [20],
      limit: limit,
    },
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 10);
  };

  return (
    <>
      {events.length === 0 && isLoading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <>
          {events.map((event) => (
            <div key={event.id} className="py-6">
              <KIND20Card 
                key={event.id} 
                pubkey={event.pubkey} 
                text={event.content} 
                image={getImageUrl(event.tags)} 
                event={event} 
                tags={event.tags} 
                eventId={event.id} 
                showViewNoteCardButton={true}
              />
            </div>
          ))}
          {!isLoading && (
            <div className="flex justify-center p-4">
              <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default ProfileFeed;