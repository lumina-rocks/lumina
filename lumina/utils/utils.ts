import { Event as NostrEvent, finalizeEvent} from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils"

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

export function extractDimensions(event: NostrEvent): { width: number; height: number } {
  const imetaTag = event.tags.find(tag => tag[0] === 'imeta');
  if (imetaTag) {
    const dimInfo = imetaTag.find(item => item.startsWith('dim '));
    if (dimInfo) {
      const [width, height] = dimInfo.split(' ')[1].split('x').map(Number);
      return { width, height };
    }
  }
  return { width: 500, height: 300 }; // Default dimensions if not found
}

export async function signEvent(loginType: string | null, event: NostrEvent): Promise<NostrEvent | null> {
    // Sign event
  let eventSigned: NostrEvent = { ...event, sig: '' };
  if (loginType === 'extension') {
    eventSigned = await window.nostr.signEvent(event);
  } else if (loginType === 'amber') {
    // TODO: Sign event with amber
    // alert('Signing with Amber is not implemented yet, sorry!');
    // return null;

    // get the full current url of the user
    let callbackUrl = window.location.host + window.location.pathname;

    console.log(callbackUrl);
    if (!callbackUrl) {
        throw new Error("Callback URL is null or undefined but needed for Amber Signing");
    }
    const intent = `intent:#Intent;scheme=nostrsigner;S.compressionType=gzip;S.returnType=signature;S.type=get_public_key;S.callbackUrl=http://${callbackUrl}?amberSignResponse=;end`;
    window.location.href = intent;
  } else if (loginType === 'raw_nsec') {
    if (typeof window !== 'undefined') {
      let nsecStr = null;
      nsecStr = window.localStorage.getItem('nsec');
      if (nsecStr != null) {
        eventSigned = finalizeEvent(event, hexToBytes(nsecStr));
      }
    }
  }
  console.log(eventSigned);
  return eventSigned;
}