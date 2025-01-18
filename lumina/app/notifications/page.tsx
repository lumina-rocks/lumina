'use client';

import { nip19 } from "nostr-tools";
import Notifications from '@/components/Notifications';

const NotificationsPage: React.FC = ({ }) => {
  let pubkey = '';

  if (typeof window !== 'undefined') {
    pubkey = window.localStorage.getItem("pubkey") ?? '';
  }

  // check if pubkey contains "npub"
  // if so, then we need to convert it to a pubkey
  if (pubkey.includes("npub")) {
    // convert npub to pubkey
    pubkey = nip19.decode(pubkey.toString()).data.toString()
  }

  return (
    <>
      <Notifications pubkey={pubkey.toString()} />
    </>
  );
}

export default NotificationsPage;