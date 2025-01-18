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
      kinds: [20],
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
        ) : (
          <>
            {events.map((event) => {
              const imageUrl = getImageUrl(event.tags);
              return (
                <QuickViewKind20NoteCard key={event.id} pubkey={event.pubkey} text={event.content} image={imageUrl} event={event} tags={event.tags} eventId={event.id} linkToNote={true} />
              );
            })}
          </>
        )}
      </div>
      {!isLoading ? (
        <div className="flex justify-center p-4">
          <Button className="w-full" onClick={loadMore}>Load More</Button>
        </div>
      ) : null}
    </>
  );
}

export default ProfileQuickViewFeed;