import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";
import NoteCard from './NoteCard';

interface FollowerFeedProps {
  pubkey: string;
}

const FollowerFeed: React.FC<FollowerFeedProps> = ({ pubkey }) => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events: following, isLoading: followingLoading } = useNostrEvents({
    filter: {
      kinds: [3],
      authors: [pubkey],
      limit: 1,
    },
  });
  // let followingPubkeys = following.map((event) => event.tags[event.tags.length - 1][1]);
  // let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 50);
  let followingPubkeys = following.flatMap((event) => event.tags.map(tag => tag[1])).slice(0, 500);

  const { events } = useNostrEvents({
    filter: {
      // since: dateToUnix(now.current), // all new events from now
      // since: 0,
      limit: 1000,
      kinds: [1],
      authors: followingPubkeys,
    },
  });

  // const filteredEvents = events.filter((event) => event.content.includes(".jpg"));
  // filter events with regex that checks for png, jpg, or gif
  let filteredEvents = events.filter((event) => event.content.match(/https?:\/\/.*\.(?:png|jpg|gif|mp4|webm)/g)?.[0]);

  // now filter all events with a tag[0] == t and tag[1] == nsfw
  filteredEvents = filteredEvents.filter((event) => event.tags.map((tag) => tag[0] == "t" && tag[1] == "nsfw"));
  // filter out all replies
  filteredEvents = filteredEvents.filter((event) => !event.tags.some((tag) => { return tag[0] == 'e' }));

  return (
    <>
      {filteredEvents.map((event) => (
        // <p key={event.id}>{event.pubkey} posted: {event.content}</p>
        <div key={event.id} className="py-6">
          <NoteCard key={event.id} pubkey={event.pubkey} text={event.content} eventId={event.id} tags={event.tags} event={event} showViewNoteCardButton={true} />
        </div>
      ))}
    </>
  );
}

export default FollowerFeed;