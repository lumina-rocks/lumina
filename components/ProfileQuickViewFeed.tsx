import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import QuickViewNoteCard from "./QuickViewNoteCard";
import { Button } from "@/components/ui/button";

interface ProfileQuickViewFeedProps {
  pubkey: string;
}

const ProfileQuickViewFeed: React.FC<ProfileQuickViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered
  const [limit, setLimit] = useState(100);

  const { isLoading ,events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      limit: limit,
      kinds: [1],
    },
  });

  let filteredEvents = events.filter((event) => event.content.match(/https?:\/\/.*\.(?:png|jpg|gif|mp4|webm|mov|jpeg)/g)?.[0]);
  // filter out all replies (tag[0] == e)
  filteredEvents = filteredEvents.filter((event) => !event.tags.some((tag) => { return tag[0] == 'e' }));

  const loadMore = () => {
    setLimit(limit => limit + 50);
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {filteredEvents.length === 0 && isLoading ? (
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
            {filteredEvents.map((event) => (
              <QuickViewNoteCard key={event.id} pubkey={event.pubkey} text={event.content} event={event} tags={event.tags} eventId={event.id} linkToNote={true} />
            ))}
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