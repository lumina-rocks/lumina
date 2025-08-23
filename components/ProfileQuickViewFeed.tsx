import { useRef, useState } from "react";
import { useNostrEvents } from "nostr-react";
import { nip19 } from "nostr-tools";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl } from "@/utils/utils";
import { PlayIcon } from "@radix-ui/react-icons";
import Link from "next/link";

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

interface ProfileQuickViewFeedProps {
  pubkey: string;
}

const ProfileQuickViewFeed: React.FC<ProfileQuickViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered
  const [limit, setLimit] = useState(20);

  const { isLoading, events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      limit: limit,
      kinds: [20, 21, 22],
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
        ) : events.length > 0 ? (
          <>
            {events.map((event) => {
              const imageUrl = getImageUrl(event.tags);
              const isVideo = event.kind === 21 || event.kind === 22;
              const videoUrl = isVideo ? getVideoUrl(event.tags) : null;
              
              if (imageUrl) {
                return (
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
                );
              } else if (isVideo && videoUrl) {
                // Create a video thumbnail with play button overlay
                return (
                  <div key={event.id} className="relative aspect-square w-full group cursor-pointer">
                    <video
                      src={videoUrl}
                      className="w-full h-full object-cover rounded-xl"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
                      <div className="bg-white bg-opacity-80 rounded-full p-3">
                        <PlayIcon className="h-6 w-6 text-black" />
                      </div>
                    </div>
                    <Link href={`/note/${nip19.neventEncode({
                      id: event.id,
                      relays: []
                    })}`} className="absolute inset-0" />
                  </div>
                );
              }
              // Fallback for text-only content
              return (
                <div key={event.id} className="relative aspect-square w-full bg-gray-100 rounded-xl flex items-center justify-center p-4">
                  <div className="text-center text-gray-500">
                    <p className="text-sm line-clamp-3">{event.content}</p>
                  </div>
                  <Link href={`/note/${nip19.neventEncode({
                    id: event.id,
                    relays: []
                  })}`} className="absolute inset-0" />
                </div>
              );
            })}
          </>
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-10 text-gray-500">
            <p className="text-lg">No posts found :(</p>
          </div>
        )}
      </div>
      {!isLoading && events.length > 0 ? (
        <div className="flex justify-center p-4">
          <Button className="w-full" onClick={loadMore}>Load More</Button>
        </div>
      ) : null}
    </>
  );
}

export default ProfileQuickViewFeed;