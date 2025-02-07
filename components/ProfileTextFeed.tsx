import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProfileTextFeedProps {
  pubkey: string;
}

const ProfileTextFeed: React.FC<ProfileTextFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(10);

  const { events, isLoading } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [1],
      limit: limit,
    },
  });

  // filter out all images since we only want text messages
  let filteredEvents = events.filter((event) => !event.content.match(/https?:\/\/.*\.(?:png|jpg|gif|jpeg)/g)?.[0]);
  // filter out all replies (tag[0] == e)
  filteredEvents = filteredEvents.filter((event) => !event.tags.some((tag) => { return tag[0] == 'e' }));

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 10);
  };

  return (
    <>
      {filteredEvents.length === 0 && isLoading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <>
          {filteredEvents.map((event) => (
            <div key={event.id} className="py-6">
              <NoteCard 
                key={event.id} 
                pubkey={event.pubkey} 
                text={event.content} 
                event={event} 
                tags={event.tags} 
                eventId={event.id} 
                showViewNoteCardButton={true} 
              />
            </div>
          ))}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="flex justify-center p-4">
              <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default ProfileTextFeed;