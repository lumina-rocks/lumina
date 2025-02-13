import { useRef } from "react";
import { useNostrEvents } from "@/hooks/useNDK";
import NoteCard from '@/components/NoteCard';
import CommentsCompontent from "@/components/CommentsCompontent";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";

interface NotePageComponentProps {
  id: string;
}

const NotePageComponent: React.FC<NotePageComponentProps> = ({ id }) => {
  const now = useRef(new Date());

  const { events } = useNostrEvents({
    filter: {
      ids: [id],
      limit: 1,
    },
  });

  // Filter out events that have other e tags (replies to other notes)
  const filteredEvents = events.filter((event) => {
    return event.tags.filter((tag) => {
      return tag[0] === 'e' && tag[1] !== id;
    }).length === 0;
  });

  return (
    <>
      {filteredEvents.map((event) => (
        <div key={event.id}>
          {event.kind === 20 ? (
            <KIND20Card
              key={event.id}
              pubkey={event.pubkey}
              text={event.content}
              image={getImageUrl(event.tags)}
              eventId={event.id}
              tags={event.tags}
              event={event.rawEvent()}
              showViewNoteCardButton={false}
            />
          ) : (
            <NoteCard
              key={event.id}
              pubkey={event.pubkey}
              text={event.content}
              eventId={event.id}
              tags={event.tags}
              event={event.rawEvent()}
              showViewNoteCardButton={false}
            />
          )}
          <div className="py-6">
            <CommentsCompontent pubkey={event.pubkey} event={event.rawEvent()} />
          </div>
        </div>
      ))}
    </>
  );
}

export default NotePageComponent;