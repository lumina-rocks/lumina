import { useRef, useState } from "react";
import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import NoteCard from "./NoteCard";
import { getImageUrl } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Function to extract video URL from imeta tags
const getVideoUrl = (tags: string[][]): string | null => {
  for (const tag of tags) {
    if (tag[0] === 'imeta') {
      for (let i = 1; i < tag.length; i++) {
        if (tag[i].startsWith('url ')) {
          return tag[i].substring(4);
        }
      }
    }
  }
  return null;
};

interface TagFeedProps {
  tag: string;
}

const TagFeed: React.FC<TagFeedProps> = ({ tag }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered
  const [limit, setLimit] = useState(25);

  const { events, isLoading } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: limit,
      kinds: [20, 21, 22],
      "#t": [tag],
    },
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 25);
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-2">
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
        ) : (
          events.map((event) => {
            const imageUrl = getImageUrl(event.tags);
            const isVideo = event.kind === 21 || event.kind === 22;
            
            if (isVideo) {
              // Use NoteCard for video content
              const videoUrl = getVideoUrl(event.tags);
              const contentWithVideo = videoUrl ? `${event.content}\n${videoUrl}` : event.content;
              return (
                <div key={event.id}>
                  <NoteCard
                    key={event.id}
                    pubkey={event.pubkey}
                    text={contentWithVideo}
                    eventId={event.id}
                    tags={event.tags}
                    event={event}
                    showViewNoteCardButton={true}
                  />
                </div>
              );
            } else {
              // Use KIND20Card for image content
              return (
                <div key={event.id}>
                  <KIND20Card key={event.id} pubkey={event.pubkey} text={event.content} image={imageUrl} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={true} />
                </div>
              );
            }
          })
        )}
      </div>
      {!isLoading && (
        <div className="flex justify-center p-4">
          <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default TagFeed;