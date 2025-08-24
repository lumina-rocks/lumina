import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import NoteCard from "./NoteCard";
import { getImageUrl } from "@/utils/utils";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

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

const GlobalFeed: React.FC = () => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(20);

  const { events, isLoading } = useNostrEvents({
    filter: {
      limit: limit,
      kinds: [20, 21, 22],
    },
  });

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 20);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-4">
        {events.map((event) => {
          const imageUrl = getImageUrl(event.tags);
          const isVideo = event.kind === 21 || event.kind === 22;
          
          if (isVideo) {
            // Use NoteCard for video content
            const videoUrl = getVideoUrl(event.tags);
            const contentWithVideo = videoUrl ? `${event.content}\n${videoUrl}` : event.content;
            return (
              <div key={event.id} className="mb-4 md:mb-6">
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
              <div key={event.id} className="mb-4 md:mb-6">
                <KIND20Card
                  key={event.id}
                  pubkey={event.pubkey}
                  text={event.content}
                  image={imageUrl}
                  eventId={event.id}
                  tags={event.tags}
                  event={event}
                  showViewNoteCardButton={true}
                />
              </div>
            );
          }
        })}
      </div>
      {!isLoading && (
        <div className="flex justify-center p-4">
          <Button className="w-full md:w-auto" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default GlobalFeed;