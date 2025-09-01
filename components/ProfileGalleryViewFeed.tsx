import { useRef } from "react";
import { useNostrEvents } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryCard from "./GalleryCard";

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

// Function to extract image URLs from imeta tags (for video thumbnails)
const getVideoImageUrl = (tags: string[][]): string | null => {
  for (const tag of tags) {
    if (tag[0] === 'imeta') {
      for (let i = 1; i < tag.length; i++) {
        if (tag[i].startsWith('image ')) {
          return tag[i].substring(6);
        }
      }
    }
  }
  return null;
};

interface ProfileGalleryViewFeedProps {
  pubkey: string;
}

const ProfileGalleryViewFeed: React.FC<ProfileGalleryViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { isLoading, events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      limit: 50,
      kinds: [10011, 21, 22],
    },
  });
  
  console.log('ProfileGalleryViewFeed events:', events.map(e => ({ id: e.id, kind: e.kind, tags: e.tags })));

  const imagesAndIds = events.map((event) => {
    if (event.kind === 10011) {
      // Handle gallery events (kind 10011)
      return {
        id: event.tags.filter((tag) => tag[0] === 'G').map((tag) => tag[1]),
        images: event.tags.filter((tag) => tag[0] === 'G').map((tag) => tag[2]),
        isVideo: false
      };
    } else if (event.kind === 21 || event.kind === 22) {
      // Handle video events (kind 21/22)
      const videoUrl = getVideoUrl(event.tags);
      const imageUrl = getVideoImageUrl(event.tags);
      if (videoUrl) {
        // If no image URL is provided in imeta, we need to handle this differently
        // For now, we'll pass the video URL but mark it as a video
        const isVideo = !imageUrl; // Mark as video if no image URL provided
        console.log('Processing kind 21/22 event:', {
          eventId: event.id,
          videoUrl,
          imageUrl,
          isVideo,
          tags: event.tags
        });
        return {
          id: [event.id],
          images: [videoUrl],
          isVideo: isVideo
        };
      }
    }
    return null;
  }).filter((item): item is { id: string[]; images: string[]; isVideo: boolean } => item !== null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {imagesAndIds.length === 0 && isLoading ? (
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
                      imagesAndIds.map((galleryEntry) => (
              galleryEntry.images.map((imageUrl, index) => (
                <GalleryCard
                  pubkey={pubkey}
                  key={`${galleryEntry.id[index]}-${index}`}
                  eventId={galleryEntry.id[index]}
                  imageUrl={imageUrl}
                  linkToNote={true}
                  isVideo={galleryEntry.isVideo}
                />
              ))
            ))
        )}
      </div>
    </>
  );
}

export default ProfileGalleryViewFeed;