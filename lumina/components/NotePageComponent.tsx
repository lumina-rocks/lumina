import { useRef } from "react";
import { useNostrEvents } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import CommentsCompontent from "@/components/CommentsCompontent";

interface NotePageComponentProps {
  id: string;
}

const NotePageComponent: React.FC<NotePageComponentProps> = ({ id }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      ids: [id],
      limit: 1,
      kinds: [1],
    },
  });

  // filter out all events that also have another e tag with another id
  const filteredEvents = events.filter((event) => { return event.tags.filter((tag) => { return tag[0] === '#e' && tag[1] !== id }).length === 0 });

  return (
    <>
      {events.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        <div key={event.id} className="py-6">
          <NoteCard key={event.id} pubkey={event.pubkey} text={event.content} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={false} />
          <div className="py-6 px-6">
            <CommentsCompontent pubkey={event.pubkey} event={event} />
          </div>
        </div>
      ))}
    </>
  );
}

export default NotePageComponent;