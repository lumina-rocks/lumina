import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";
import { getImageUrl } from "@/utils/utils";
import QuickViewKind20NoteCard from "./QuickViewKind20NoteCard";

const GlobalFeed: React.FC = () => {
  const { events } = useNostrEvents({
    filter: {
      limit: 100,
      kinds: [20],
    },
  });

  return (
    <>
      <h2>Global Feed</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 space-x-2">
        {events.map((event) => {
          const imageUrl = getImageUrl(event.tags);
          return (
            <div key={event.id} className="py-6">
              <KIND20Card
                key={event.id}
                pubkey={event.pubkey}
                text={event.content}
                image={imageUrl}
                eventId={event.id}
                tags={event.tags}
                event={event}
                showViewNoteCardButton={true}
              />
              {/* <QuickViewKind20NoteCard
                key={event.id}
                pubkey={event.pubkey}
                text={event.content}
                image={imageUrl}
                eventId={event.id}
                tags={event.tags}
                event={event}
                linkToNote={true}
                /> */}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default GlobalFeed;

