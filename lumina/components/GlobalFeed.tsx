import { useNostrEvents } from "nostr-react";
import KIND20Card from "./KIND20Card";

export function getImageUrl(tags: string[][]): string {
  const imetaTag = tags.find(tag => tag[0] === 'imeta');
  if (imetaTag) {
    const urlItem = imetaTag.find(item => item.startsWith('url '));
    if (urlItem) {
      return urlItem.split(' ')[1];
    }
  }
  return '';
}

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
          </div>
        );
      })}
    </>
  );
}

export default GlobalFeed;

