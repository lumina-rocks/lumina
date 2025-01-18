import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import QuickViewNoteCard from "./QuickViewNoteCard";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl } from "@/utils/utils";

interface FollowerQuickViewFeedProps {
  pubkey: string;
}

const FollowerQuickViewFeed: React.FC<FollowerQuickViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events: following, isLoading: followingLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [pubkey],
      limit: 1,
    },
  });
  // let followingPubkeys = following.map((event) => event.tags[event.tags.length - 1][1]);
  // let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 50);
  let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 500);

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: 25,
      kinds: [20],
      authors: followingPubkeys,
    },
  });

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {events.length === 0 ? (
          <>
          <div>
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          <div>
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          <div>
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          </>
        ) : (events.map((event) => (
          <QuickViewKind20NoteCard key={event.id} pubkey={event.pubkey} text={event.content} image={getImageUrl(event.tags)} event={event} tags={event.tags} eventId={event.id} linkToNote={true} />
        )))}
      </div>
    </>
  );
}

export default FollowerQuickViewFeed;