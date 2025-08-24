import { useRef, useState } from "react";
import { useNostrEvents, useProfile } from "nostr-react";
import { nip19 } from "nostr-tools";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";
import { getImageUrl, getThumbnailUrl } from "@/utils/utils";
import Link from "next/link";
import { Play } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

// Component to display profile picture with optional play button
const ProfilePictureCard: React.FC<{ 
  pubkey: string; 
  eventId: string; 
  showPlayButton: boolean; 
}> = ({ pubkey, eventId, showPlayButton }) => {
  const { data: userData } = useProfile({
    pubkey,
  });
  
  const profileImageSrc = userData?.picture || `https://robohash.org/${pubkey}`;
  
  return (
    <div className="relative aspect-square w-full bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
      <Avatar className="w-full h-full rounded-xl">
        <AvatarImage 
          src={profileImageSrc} 
          className="w-full h-full object-cover"
        />
      </Avatar>
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-80 rounded-full p-3">
            <Play className="w-8 h-8 text-black" />
          </div>
        </div>
      )}
      <Link 
        href={`/note/${nip19.neventEncode({
          id: eventId,
          relays: []
        })}`} 
        className="absolute inset-0" 
      />
    </div>
  );
};

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
              const thumbnailUrl = isVideo ? getThumbnailUrl(event.tags) : null;
              
              // Use QuickViewKind20NoteCard for images and videos with thumbnails
              if (imageUrl || (isVideo && thumbnailUrl)) {
                return (
                  <QuickViewKind20NoteCard
                    key={event.id}
                    pubkey={event.pubkey}
                    text={event.content}
                    image={imageUrl || thumbnailUrl || ""} // Prefer thumbnail for videos
                    event={event}
                    tags={event.tags}
                    eventId={event.id}
                    linkToNote={true}
                  />
                );
              }
              
              // For videos without thumbnails, show profile picture with play button
              if (isVideo && videoUrl) {
                return (
                  <ProfilePictureCard 
                    key={event.id} 
                    pubkey={event.pubkey} 
                    eventId={event.id}
                    showPlayButton={true}
                  />
                );
              }
              
              // Fallback for text-only content - show profile picture
              return (
                <ProfilePictureCard 
                  key={event.id} 
                  pubkey={event.pubkey} 
                  eventId={event.id}
                  showPlayButton={false}
                />
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