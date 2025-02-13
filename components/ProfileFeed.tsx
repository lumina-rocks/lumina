import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import { useNostrEvents } from "@/hooks/useNDK";

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
      limit,
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
          {!isLoading && (
            <div className="flex justify-center p-4">
              <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <p className="text-lg">No posts found :(</p>
        </div>
      )}
    </>
  );
}

export default ProfileFeed;