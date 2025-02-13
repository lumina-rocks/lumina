import { useRef } from "react";
import { useNostrEvents } from "@/hooks/useNDK";
import NoteCard from './NoteCard';

const ReelFeed: React.FC = () => {
  const now = useRef(new Date());

  const { events } = useNostrEvents({
    filter: {
      kinds: [1063],
      since: Math.floor(now.current.getTime() / 1000) - 24 * 60 * 60, // Last 24 hours
    },
  });

  // Filter events with media content
  let filteredEvents = events.filter((event) => event.content.match(/https?:\/\/.*\.(?:png|jpg|gif|jpeg)/g)?.[0]);

  // Filter out NSFW content
  filteredEvents = filteredEvents.filter((event) => {
    return !event.tags.some(tag => tag[0] === 't' && tag[1] === 'nsfw');
  });

  return (
    <>
      {filteredEvents.map((event) => (
        <div key={event.id} className="py-6">
          <NoteCard
            key={event.id}
            pubkey={event.pubkey}
            text={event.content}
            eventId={event.id}
            tags={event.tags}
            event={event.rawEvent()}
            showViewNoteCardButton={true}
          />
        </div>
      ))}
    </>
  );
}

export default ReelFeed;