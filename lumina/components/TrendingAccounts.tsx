import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from './NoteCard';

const TrendingAccounts: React.FC = () => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: 100,
      kinds: [1],
    },
  });

  // const filteredEvents = events.filter((event) => event.content.includes(".jpg"));
  // filter events with regex that checks for png, jpg, or gif
  let filteredEvents = events.filter((event) => event.content.match(/https?:\/\/.*\.(?:png|jpg|gif)/g)?.[0]);

  // now filter all events with a tag[0] == t and tag[1] == nsfw
  filteredEvents = filteredEvents.filter((event) => event.tags.map((tag) => tag[0] == "t" && tag[1] == "nsfw"));
  // filter out all replies
  filteredEvents = filteredEvents.filter((event) => event.tags.map((tag) => tag[0] == "e"));

  return (
    <>
      <h2>Global Feed</h2>
      {filteredEvents.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        <div key={event.id} className="py-6">
          <NoteCard key={event.id} pubkey={event.pubkey} text={event.content} eventId={event.id} tags={event.tags} event={event} />
        </div>
      ))}
    </>
  );
}

export default TrendingAccounts;