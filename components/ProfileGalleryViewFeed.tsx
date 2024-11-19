import { useRef } from "react";
import { useNostrEvents } from "nostr-react";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryCard from "./GalleryCard";

interface ProfileGalleryViewFeedProps {
  pubkey: string;
}

const ProfileGalleryViewFeed: React.FC<ProfileGalleryViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { isLoading, events } = useNostrEvents({
    filter: {
      authors: [pubkey],
      limit: 1,
      kinds: [10011],
    },
  });

  const imagesAndIds = events.map((event) => {
    return {
      id: event.tags.filter((tag) => tag[0] === 'G').map((tag) => tag[1]),
      images: event.tags.filter((tag) => tag[0] === 'G').map((tag) => tag[2])
    }
  });

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
              />
            ))
          ))
        )}
      </div>
    </>
  );
}

export default ProfileGalleryViewFeed;