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
import { PinIcon } from "lucide-react";

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
          const videoUrl = tag[i].substring(4);
          console.log("Found video URL in imeta tag:", videoUrl);
          return videoUrl;
        }
      }
    }
  }
  console.log("No video URL found in tags:", tags);
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



// Function to get the first reference tag for opening source
const getFirstReferenceTag = (tags: string[][]): { type: string; value: string; relays?: string[] } | null => {
  for (const tag of tags) {
    if (tag[0] === 'e') {
      const result = { type: 'e', value: tag[1], relays: tag.slice(2) };
      console.log("Found 'e' tag:", result);
      return result;
    }
    if (tag[0] === 'a') {
      const result = { type: 'a', value: tag[1], relays: tag.slice(2) };
      console.log("Found 'a' tag:", result);
      return result;
    }
    if (tag[0] === 'u') {
      const result = { type: 'u', value: tag[1] };
      console.log("Found 'u' tag:", result);
      return result;
    }
  }
  console.log("No reference tag found in tags:", tags);
  return null;
};

// Function to determine if an event should show a pin and what it should do
const getPinInfo = (event: any, pubkey: string, pinnedEventIds: string[]): { showPin: boolean; referenceTag: { type: string; value: string; relays?: string[] } | null } => {
  const isOwnEvent = event.pubkey === pubkey;
  const isMediaEvent = event.kind === 20 || event.kind === 21 || event.kind === 22;
  const isPinned = pinnedEventIds.includes(event.id);
  const hasReferenceTag = getFirstReferenceTag(event.tags);
  const isGalleryEvent = event.content.includes('#gallery') || event.tags.some((tag: string[]) => tag[0] === 't' && tag[1] === 'gallery');
  

  
  // Case 1: If it's my kind 20, 21, or 22 and has a reference tag, show pin to that reference
  if (isOwnEvent && isMediaEvent && hasReferenceTag) {
    return { showPin: true, referenceTag: hasReferenceTag };
  }
  
  // Case 2: If it's pinned (came onto board because it or an event that references it contained "gallery")
  if (isPinned) {
    return { showPin: true, referenceTag: { type: 'e', value: event.id } };
  }
  
  // Case 3: If it's my own event with gallery tag
  if (isOwnEvent && isGalleryEvent) {
    return { showPin: true, referenceTag: { type: 'gallery', value: 'gallery' } };
  }
  
  // Case 4: If it's any kind 21 event with a reference tag, show pin (for debugging)
  if (event.kind === 21 && hasReferenceTag) {
    return { showPin: true, referenceTag: hasReferenceTag };
  }
  
  return { showPin: false, referenceTag: null };
};

// Function to handle pin click
const handlePinClick = (referenceTag: { type: string; value: string; relays?: string[] }) => {
  console.log("Pin clicked with referenceTag:", referenceTag);
  
  if (referenceTag.type === 'u') {
    // Open URL in new tab
    console.log("Opening URL:", referenceTag.value);
    window.open(referenceTag.value, '_blank');
  } else if (referenceTag.type === 'e') {
    // For event references, use nevent encoding to go to note page
    console.log("Opening event:", referenceTag.value);
    const nevent = nip19.neventEncode({
      id: referenceTag.value,
      relays: referenceTag.relays || []
    });
    console.log("Navigating to:", `/note/${nevent}`);
    window.location.href = `/note/${nevent}`;
  } else if (referenceTag.type === 'a') {
    // For address references, check the kind and route appropriately
    console.log("Opening address:", referenceTag.value);
    const parts = referenceTag.value.split(':');
    if (parts.length >= 3) {
      const kind = parseInt(parts[2]);
      const pubkey = parts[1];
      
      if (kind === 0) {
        // Kind 0 (profile) - go to profile page using npub
        const npub = nip19.npubEncode(pubkey);
        console.log("Navigating to profile:", `/profile/${npub}`);
        window.location.href = `/profile/${npub}`;
      } else {
        // All other kinds - go to njump (since we don't have the event ID for nevent)
        console.log("Opening in njump:", `https://njump.me/${referenceTag.value}`);
        window.open(`https://njump.me/${referenceTag.value}`, '_blank');
      }
    } else {
      // Fallback to njump for malformed addresses
      console.log("Fallback to njump:", `https://njump.me/${referenceTag.value}`);
      window.open(`https://njump.me/${referenceTag.value}`, '_blank');
    }
  } else {
    console.log("Unknown reference tag type:", referenceTag.type);
  }
};

// Component for the purple pin icon
const PinButton: React.FC<{ 
  referenceTag: { type: string; value: string; relays?: string[] };
  onPinClick?: (referenceTag: { type: string; value: string; relays?: string[] }) => void;
}> = ({ referenceTag, onPinClick }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onPinClick) {
          onPinClick(referenceTag);
        } else {
          handlePinClick(referenceTag);
        }
      }}
      className="absolute top-3 right-3 z-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
      title="Open source"
    >
      <PinIcon className="w-3 h-3" />
    </button>
  );
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
      kinds: [1, 20, 21, 22, 1111],
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

  // Filter user's own events that contain "#gallery" in content or have "gallery" t-tag
  const userGalleryEvents = userEvents.filter(event => {
    // Check for "#gallery" in content
    if (event.content.includes('#gallery')) {
      return true;
    }
    
    // Check for "gallery" t-tag
    const hasGalleryTag = event.tags.some((tag: string[]) => 
      tag[0] === 't' && tag[1] === 'gallery'
    );
    
    return hasGalleryTag;
  });

  // Combine all events: user's media posts + pinned events (the actual media events) + user's gallery events
  const allEvents = [...userEvents, ...pinnedEvents, ...userGalleryEvents];
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
    
    // Debug logging for the specific event
    if (event.id === "aefcd52baa6f63684d7304c94228dbff886378ef6ba1d26febd5110b041e6996") {
      console.log("hasVideoContent check:", {
        eventId: event.id,
        videoMatch,
        videoUrl,
        result: videoMatch && videoMatch.length > 0 || !!videoUrl
      });
    }
    
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
              const hasVideo = hasVideoContent(event);
              const hasAudio = hasAudioContent(event);
              const hasImage = hasImageContent(event);
              const { showPin, referenceTag } = getPinInfo(event, pubkey, pinnedEventIds);
              

              
              // Priority: Video > Audio > Image > Pinned (no media)
              if (isVideo || hasVideo) {
                const videoUrl = getVideoUrl(event.tags);
                const thumbnailUrl = getThumbnailUrl(event.tags);
                

                
                // If video has a thumbnail, use KIND20Card to display the thumbnail
                if (thumbnailUrl) {
                  return (
                    <div key={event.id} className="relative">
                      {showPin && referenceTag && (
                        <PinButton referenceTag={referenceTag} />
                      )}
                      <KIND20Card
                        pubkey={event.pubkey}
                        text={event.content}
                        image={thumbnailUrl}
                        event={event}
                        tags={event.tags}
                        eventId={event.id}
                        showViewNoteCardButton={true}
                        videoUrl={videoUrl || undefined}
                      />
                    </div>
                  );
                } else if (videoUrl) {
                  // If no thumbnail but video URL exists, use NoteCard to display the video
                  const contentWithVideo = `${event.content}\n${videoUrl}`;
                  return (
                    <div key={event.id} className="relative">
                      {showPin && referenceTag && (
                        <PinButton referenceTag={referenceTag} />
                      )}
                      <NoteCard
                        pubkey={event.pubkey}
                        text={contentWithVideo}
                        eventId={event.id}
                        tags={event.tags}
                        event={event}
                        showViewNoteCardButton={true}
                        onPinClick={handlePinClick}
                      />
                    </div>
                  );
                } else {
                  // If no video URL found, try to extract from content
                  const videoMatch = event.content.match(/https?:\/\/[^ ]*\.(mp4|webm|mov|avi|mkv)/g);
                  if (videoMatch && videoMatch.length > 0) {
                    return (
                      <div key={event.id} className="relative">
                        {showPin && referenceTag && (
                          <PinButton 
                            referenceTag={referenceTag} 
                            onPinClick={handlePinClick}
                          />
                        )}
                        <NoteCard
                          pubkey={event.pubkey}
                          text={event.content}
                          eventId={event.id}
                          tags={event.tags}
                          event={event}
                          showViewNoteCardButton={true}
                          onPinClick={handlePinClick}
                        />
                      </div>
                    );
                  }
                }
              } else if (hasAudio) {
                // For audio content, use NoteCard
                return (
                  <div key={event.id} className="relative">
                    {showPin && referenceTag && (
                      <PinButton 
                        referenceTag={referenceTag} 
                        onPinClick={handlePinClick}
                      />
                    )}
                    <NoteCard
                      pubkey={event.pubkey}
                      text={event.content}
                      eventId={event.id}
                      tags={event.tags}
                      event={event}
                      showViewNoteCardButton={true}
                      onPinClick={handlePinClick}
                    />
                  </div>
                );
              } else if (hasImage && imageUrl) {
                // Use KIND20Card for image content
                return (
                  <div key={event.id} className="relative">
                    {showPin && referenceTag && (
                      <PinButton 
                        referenceTag={referenceTag} 
                        onPinClick={handlePinClick}
                      />
                    )}
                    <KIND20Card
                      pubkey={event.pubkey}
                      text={event.content}
                      image={imageUrl}
                      event={event}
                      tags={event.tags}
                      eventId={event.id}
                      showViewNoteCardButton={true}
                    />
                  </div>
                );
              } else if (pinnedEventIds.includes(event.id)) {
                // For pinned events without images/videos, show profile picture
                return (
                  <div key={event.id} className="relative">
                    {showPin && referenceTag && (
                      <PinButton 
                        referenceTag={referenceTag} 
                        onPinClick={handlePinClick}
                      />
                    )}
                    <ProfilePictureCard
                      pubkey={event.pubkey}
                      eventId={event.id}
                      content={event.content}
                    />
                  </div>
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