import { Event as NostrEvent } from "nostr-tools";
// import { encode } from 'blurhash';

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

// export async function getBlurhash(imageUrl: string): Promise<string> {
//   try {
//     const response = await fetch(imageUrl);
//     const arrayBuffer = await response.arrayBuffer();
//     const uint8Array = new Uint8Array(arrayBuffer);
    
//     const image = await createImageBitmap(new Blob([uint8Array]));
//     const canvas = new OffscreenCanvas(32, 32);
//     const ctx = canvas.getContext('2d');
    
//     if (!ctx) {
//       throw new Error('Could not get canvas context');
//     }
    
//     ctx.drawImage(image, 0, 0, 32, 32);
//     const imageData = ctx.getImageData(0, 0, 32, 32);
    
//     return encode(imageData.data, 32, 32, 4, 4);
//   } catch (error) {
//     console.error('Error generating blurhash:', error);
//     return '';
//   }
// }

export function getBlurhashFromTags(tags: string[][]): string {
  const imetaTag = tags.find(tag => tag[0] === 'imeta');
  if (imetaTag) {
    const blurhashItem = imetaTag.find(item => item.startsWith('blurhash '));
    if (blurhashItem) {
      return blurhashItem.split(' ')[1];
    }
  }
  return '';
}