import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix, useProfile } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import KIND20Card from "./KIND20Card";
import { getImageUrl, getThumbnailUrl } from "@/utils/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { nip19 } from "nostr-tools";

// Component to display profile picture for pinned events
const ProfilePictureCard: React.FC<{ 
  pubkey: string; 
  eventId: string; 
  content: string;
}> = ({ pubkey, eventId, content }) => {
  const { data: userData } = useProfile({
    pubkey,
  });
  
  const profileImageSrc = userData?.picture || `https://robohash.org/${pubkey}`;
  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  
  return (
    <div className="relative bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profileImageSrc} />
          </Avatar>
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-gray-500">Pinned by you</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profileImageSrc} />
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 line-clamp-3">{content}</p>
          </div>
        </div>
      </div>
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

interface ProfileFeedProps {
  pubkey: string;
}

const ProfileFeed: React.FC<ProfileFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date());
  const [limit, setLimit] = useState(10);

  // Get user's own posts (kinds 20, 21, 22)
  const { events: userEvents, isLoading: userEventsLoading } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [20, 21, 22],
      limit: limit,
    },
  });

  // Get events that the user has "pinned" by responding with #gallery
  const { events: galleryReplies } = useNostrEvents({
    filter: {
      authors: [pubkey],
      "#t": ["gallery"],
      kinds: [1], // replies are typically kind 1
      limit: 100,
    },
  });

  // Extract the event IDs that the user has pinned with #gallery
  const pinnedEventIds = galleryReplies
    .map(event => event.tags.find(tag => tag[0] === 'e')?.[1])
    .filter(id => id) as string[];

  // Get the actual events that the user has pinned
  const { events: pinnedEvents, isLoading: pinnedEventsLoading } = useNostrEvents({
    filter: {
      ids: pinnedEventIds,
      limit: 100,
    },
  });

  // Combine user events and pinned events, remove duplicates
  const allEvents = [...userEvents, ...pinnedEvents];
  const uniqueEvents = allEvents.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );

  const isLoading = userEventsLoading || pinnedEventsLoading;

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 10);
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
        {uniqueEvents.length === 0 && isLoading ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : uniqueEvents.some(event => getImageUrl(event.tags) || event.kind === 21 || event.kind === 22 || pinnedEventIds.includes(event.id)) ? (
          <>
            {uniqueEvents.map((event) => {
              const imageUrl = getImageUrl(event.tags);
              const isVideo = event.kind === 21 || event.kind === 22;
              const isPinned = pinnedEventIds.includes(event.id);
              
              if (isVideo) {
                const videoUrl = getVideoUrl(event.tags);
                const thumbnailUrl = getThumbnailUrl(event.tags);
                
                // If video has a thumbnail, use KIND20Card to display the thumbnail
                if (thumbnailUrl) {
                  return (
                    <KIND20Card
                      key={event.id}
                      pubkey={event.pubkey}
                      text={event.content}
                      image={thumbnailUrl}
                      event={event}
                      tags={event.tags}
                      eventId={event.id}
                      showViewNoteCardButton={true}
                      videoUrl={videoUrl || undefined}
                    />
                  );
                } else if (videoUrl) {
                  // If no thumbnail but video URL exists, use NoteCard to display the video
                  const contentWithVideo = `${event.content}\n${videoUrl}`;
                  return (
                    <NoteCard
                      key={event.id}
                      pubkey={event.pubkey}
                      text={contentWithVideo}
                      eventId={event.id}
                      tags={event.tags}
                      event={event}
                      showViewNoteCardButton={true}
                    />
                  );
                }
              } else if (imageUrl) {
                // Use KIND20Card for image content
                return (
                  <KIND20Card
                    key={event.id}
                    pubkey={event.pubkey}
                    text={event.content}
                    image={imageUrl}
                    event={event}
                    tags={event.tags}
                    eventId={event.id}
                    showViewNoteCardButton={true}
                  />
                );
              } else if (isPinned) {
                // For pinned events without images/videos, show profile picture
                return (
                  <ProfilePictureCard
                    key={event.id}
                    pubkey={event.pubkey}
                    eventId={event.id}
                    content={event.content}
                  />
                );
              }
              return null;
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <p className="text-lg">No posts found :(</p>
          </div>
        )}
      </div>
      {!isLoading && (
        <div className="flex justify-center p-4">
          <Button className="w-full" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default ProfileFeed;