import { useRef } from "react";
import { useNostrEvents } from "@/hooks/useNDK";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryCard from "./GalleryCard";

interface ProfileGalleryViewFeedProps {
  pubkey: string;
}

const ProfileGalleryViewFeed: React.FC<ProfileGalleryViewFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());

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
        {isLoading ? (
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
          imagesAndIds.map(({ id, images }) => (
            images.map((image, index) => (
              <GalleryCard key={index} pubkey={pubkey} eventId={id[index]} imageUrl={image} linkToNote={true} />
            ))
          ))
        )}
      </div>
    </>
  );
}

export default ProfileGalleryViewFeed;