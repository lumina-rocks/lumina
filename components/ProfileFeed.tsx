import { useRef, useState } from "react";
import { useNostrEvents, dateToUnix, useProfile } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import KIND20Card from "./KIND20Card";
import { getImageUrl, getThumbnailUrl } from "@/utils/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
            <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
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
              <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
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

// Function to extract audio URL from imeta tags
const getAudioUrl = (tags: string[][]): string | null => {
  for (const tag of tags) {
    if (tag[0] === 'imeta') {
      const mimeItem = tag.find(item => item.startsWith('m '));
      const urlItem = tag.find(item => item.startsWith('url '));
      
      if (mimeItem && mimeItem.startsWith('m audio/') && urlItem) {
        return urlItem.substring(4);
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

  // Get events that contain "#gallery" in content or have "gallery" t-tag
  const { events: galleryTaggedEvents } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [1, 20, 21, 22, 1111],
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

  // Filter gallery tagged events
  const galleryEvents = galleryTaggedEvents.filter(event => {
    // Check for "#gallery" in content
    if (event.content.includes('#gallery')) {
      return true;
    }
    
    // Check for "gallery" t-tag
    const hasGalleryTag = event.tags.some(tag => 
      tag[0] === 't' && tag[1] === 'gallery'
    );
    
    return hasGalleryTag;
  });

  // Combine all events: user's media posts + pinned events + gallery tagged events
  const allEvents = [...userEvents, ...pinnedEvents, ...galleryEvents];
  const uniqueEvents = allEvents.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );

  const isLoading = userEventsLoading || pinnedEventsLoading;

  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 10);
  };

  // Helper function to check if an event contains video content
  const hasVideoContent = (event: any): boolean => {
    // Check for video URLs in content
    const videoMatch = event.content.match(/https?:\/\/[^ ]*\.(mp4|webm|mov|avi|mkv)/g);
    if (videoMatch && videoMatch.length > 0) return true;
    
    // Check for video URLs in imeta tags
    const videoUrl = getVideoUrl(event.tags);
    if (videoUrl) return true;
    
    return false;
  };

  // Helper function to check if an event contains audio content
  const hasAudioContent = (event: any): boolean => {
    // Check for audio URLs in content
    const audioMatch = event.content.match(/https?:\/\/[^ ]*\.(mp3|wav|ogg|flac|aac|m4a)/g);
    if (audioMatch && audioMatch.length > 0) return true;
    
    // Check for audio URLs in imeta tags
    const audioUrl = getAudioUrl(event.tags);
    if (audioUrl) return true;
    
    return false;
  };

  // Helper function to check if an event contains image content
  const hasImageContent = (event: any): boolean => {
    const imageUrl = getImageUrl(event.tags);
    if (imageUrl) return true;
    
    // Check for image URLs in content
    const imageMatch = event.content.match(/https?:\/\/[^ ]*\.(png|jpg|gif|jpeg|webp|bmp|svg)/g);
    if (imageMatch && imageMatch.length > 0) return true;
    
    return false;
  };

  // Helper function to check if an event has any media content
  const hasMediaContent = (event: any): boolean => {
    return hasVideoContent(event) || hasAudioContent(event) || hasImageContent(event);
  };

  // Filter events to only include those with media content or are pinned
  const mediaEvents = uniqueEvents.filter(event => {
    const isPinned = pinnedEventIds.includes(event.id);
    const hasMedia = hasMediaContent(event);
    return isPinned || hasMedia;
  });

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
        {mediaEvents.length === 0 && isLoading ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : mediaEvents.length > 0 ? (
          <>
            {mediaEvents.map((event) => {
              const imageUrl = getImageUrl(event.tags);
              const isVideo = event.kind === 21 || event.kind === 22;
              const isPinned = pinnedEventIds.includes(event.id);
              const hasVideo = hasVideoContent(event);
              const hasAudio = hasAudioContent(event);
              const hasImage = hasImageContent(event);
              
              // Priority: Video > Audio > Image > Pinned (no media)
              if (isVideo || hasVideo) {
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
                } else {
                  // If no video URL found, try to extract from content
                  const videoMatch = event.content.match(/https?:\/\/[^ ]*\.(mp4|webm|mov|avi|mkv)/g);
                  if (videoMatch && videoMatch.length > 0) {
                    return (
                      <NoteCard
                        key={event.id}
                        pubkey={event.pubkey}
                        text={event.content}
                        eventId={event.id}
                        tags={event.tags}
                        event={event}
                        showViewNoteCardButton={true}
                      />
                    );
                  }
                }
              } else if (hasAudio) {
                // For audio content, use NoteCard
                return (
                  <NoteCard
                    key={event.id}
                    pubkey={event.pubkey}
                    text={event.content}
                    eventId={event.id}
                    tags={event.tags}
                    event={event}
                    showViewNoteCardButton={true}
                  />
                );
              } else if (hasImage && imageUrl) {
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
      {!isLoading && mediaEvents.length > 0 && (
        <div className="flex justify-center p-4">
          <Button className="w-full" onClick={loadMore}>Load More</Button>
        </div>
      )}
    </>
  );
}

export default ProfileFeed;