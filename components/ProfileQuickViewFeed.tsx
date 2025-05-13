import { useRef, useState } from "react";
import { useNostrEvents } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl } from "@/utils/utils";

interface ProfileQuickViewFeedProps {
  pubkey: string;
}

const ProfileQuickViewFeed: React.FC<ProfileQuickViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered
  const [limit, setLimit] = useState(100);

  const { isLoading, events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      limit: limit,
      kinds: [1, 20],
    },
  });

  const loadMore = () => {
    setLimit(limit => limit + 50);
  }

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
                  event={event}
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

export default ProfileQuickViewFeed;