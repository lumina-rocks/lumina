## Installation

```
npm install nostr-react
```

## Example usage:

Wrap your app in the NostrProvider:

```tsx
import { NostrProvider } from "nostr-react";

const relayUrls = [
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.ch",
];

function MyApp() {
  return (
    <NostrProvider relayUrls={relayUrls} debug={true}>
      <App />
    </NostrProvider>
  );
};
```

You can now use the `useNostr` and `useNostrEvents` hooks in your components!

**Fetching all `text_note` events starting now:**

```tsx
import { useRef } from "react";
import { useNostrEvents, dateToUnix } from "nostr-react";

const GlobalFeed = () => {
  const now = useRef(new Date()); // Make sure current time isn't re-rendered

  const { events } = useNostrEvents({
    filter: {
      since: dateToUnix(now.current), // all new events from now
      kinds: [1],
    },
  });

  return (
    <>
      {events.map((event) => (
        <p key={event.id}>{event.pubkey} posted: {event.content}</p>
      ))}
    </>
  );
};
```

**Fetching all `text_note` events from a specific user, since the beginning of time:**

```tsx
import { useNostrEvents } from "nostr-react";

const ProfileFeed = () => {
  const { events } = useNostrEvents({
    filter: {
      authors: [
        "9c2a6495b4e3de93f3e1cc254abe4078e17c64e5771abc676a5e205b62b1286c",
      ],
      since: 0,
      kinds: [1],
    },
  });

  return (
    <>
      {events.map((event) => (
        <p key={event.id}>{event.pubkey} posted: {event.content}</p>
      ))}
    </>
  );
};
```

**Fetching user profiles**

Use the `useProfile` hook to render user profiles. You can use this in multiple components at once (for example, rendering a name and avatar for each message in a chat), the hook will automatically use *batching* to prevent errors where a client sends too many requests at once. 🎉

```tsx
import { useProfile } from "nostr-react";

const Profile = () => {
  const { data: userData } = useProfile({
    pubkey,
  });

  return (
    <>
      <p>Name: {userData?.name}</p>
      <p>Public key: {userData?.npub}</p>
      <p>Picture URL: {userData?.picture}</p>
    </>
  )
}
```

**Post a message:**

```tsx
import { useNostr, dateToUnix } from "nostr-react";

import {
  type Event as NostrEvent,
  getEventHash,
  getPublicKey,
  signEvent,
} from "nostr-tools";

export default function PostButton() {
  const { publish } = useNostr();

  const onPost = async () => {
    const privKey = prompt("Paste your private key:");

    if (!privKey) {
      alert("no private key provided");
      return;
    }

    const message = prompt("Enter the message you want to send:");

    if (!message) {
      alert("no message provided");
      return;
    }

    const event: NostrEvent = {
      content: message,
      kind: 1,
      tags: [],
      created_at: dateToUnix(),
      pubkey: getPublicKey(privKey),
    };

    event.id = getEventHash(event);
    event.sig = signEvent(event, privKey);

    publish(event);
  };

  return (
    <Button onClick={onPost}>Post a message!</Button>
  );
}
```