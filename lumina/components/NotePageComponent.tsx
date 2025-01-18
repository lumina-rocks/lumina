import { useRef } from "react";
import { useNostrEvents } from "nostr-react";
import NoteCard from '@/components/NoteCard';
import CommentsCompontent from "@/components/CommentsCompontent";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface NotePageComponentProps {
  id: string;
}

const NotePageComponent: React.FC<NotePageComponentProps> = ({ id }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      ids: [id],
      limit: 1,
    },
  });

  // filter out all events that also have another e tag with another id
  const filteredEvents = events.filter((event) => {
    return event.tags.filter((tag) => {
      return tag[0] === '#e' && tag[1] !== id;
    }).length === 0;
  });

  return (
    <>
      {filteredEvents.map((event) => (
        <div key={event.id} className="py-6">
        {event.kind === 1 && (
          <NoteCard
            key={event.id}
            pubkey={event.pubkey}
            text={event.content}
            eventId={event.id}
            tags={event.tags}
            event={event}
            showViewNoteCardButton={false}
          />
        )}
        {event.kind === 20 && (
          <KIND20Card
            key={event.id}
            pubkey={event.pubkey}
            text={event.content}
            image={getImageUrl(event.tags)}
            eventId={event.id}
            tags={event.tags}
            event={event}
            showViewNoteCardButton={false}
          />
        )}
          <div className="py-6 px-6">
            <CommentsCompontent pubkey={event.pubkey} event={event} />
          </div>
        </div>
      ))}
    </>
  );
}

export default NotePageComponent;