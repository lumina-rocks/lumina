import { Event as NostrEvent } from "nostr-tools";

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
