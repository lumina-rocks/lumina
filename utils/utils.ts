import { Event as NostrEvent, finalizeEvent} from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils"
import { signEventWithBunker } from "./bunkerUtils";

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
    alert('Signing with Amber is not implemented yet, sorry!');
    return null;
  } else if (loginType === 'bunker') {
    // Sign with bunker (NIP-46)
    const signedWithBunker = await signEventWithBunker(event);
    if (signedWithBunker) {
      return signedWithBunker;
    } else {
      alert('Failed to sign with bunker. Please check your connection and try again.');
      return null;
    }
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

// Blacklist annoying pubkeys
export const blacklistPubkeys = new Set([
  "0403c86a1bb4cfbc34c8a493fbd1f0d158d42dd06d03eaa3720882a066d3a378",
  "7444faae22d4d4939c815819dca3c4822c209758bf86afc66365db5f79f67ddb",
  "3ffac3a6c859eaaa8cdddb2c7002a6e10b33efeb92d025b14ead6f8a2d656657",
  "5943c88f3c60cd9edb125a668e2911ad419fc04e94549ed96a721901dd958372",
]);