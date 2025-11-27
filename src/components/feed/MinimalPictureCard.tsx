import type { NostrEvent } from '@nostrify/nostrify';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { nip19 } from 'nostr-tools';

interface MinimalPictureCardProps {
  event: NostrEvent;
}

interface ImageMeta {
  url: string;
  alt?: string;
}

function parseImetaTags(event: NostrEvent): ImageMeta[] {
  const images: ImageMeta[] = [];
  
  for (const tag of event.tags) {
    if (tag[0] === 'imeta') {
      const imageMeta: ImageMeta = { url: '' };
      
      for (let i = 1; i < tag.length; i++) {
        const part = tag[i];
        if (part.startsWith('url ')) {
          imageMeta.url = part.substring(4);
        } else if (part.startsWith('alt ')) {
          imageMeta.alt = part.substring(4);
        }
      }
      
      if (imageMeta.url) {
        images.push(imageMeta);
      }
    }
  }
  
  return images;
}

export function MinimalPictureCard({ event }: MinimalPictureCardProps) {
  const images = parseImetaTags(event);
  const title = event.tags.find(([name]) => name === 'title')?.[1] || '';

  if (images.length === 0) {
    return null;
  }

  // Use the first image only
  const firstImage = images[0];
  const noteId = nip19.noteEncode(event.id);

  return (
    <a 
      href={`/${noteId}`}
      className="overflow-hidden rounded-lg block cursor-pointer group"
    >
      <AspectRatio ratio={1}>
        <img
          src={firstImage.url}
          alt={firstImage.alt || title || 'Picture'}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </AspectRatio>
    </a>
  );
}
