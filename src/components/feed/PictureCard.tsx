import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PictureCardProps {
  event: NostrEvent;
}

interface ImageMeta {
  url: string;
  alt?: string;
  blurhash?: string;
  dim?: string;
  m?: string;
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
        } else if (part.startsWith('blurhash ')) {
          imageMeta.blurhash = part.substring(9);
        } else if (part.startsWith('dim ')) {
          imageMeta.dim = part.substring(4);
        } else if (part.startsWith('m ')) {
          imageMeta.m = part.substring(2);
        }
      }
      
      if (imageMeta.url) {
        images.push(imageMeta);
      }
    }
  }
  
  return images;
}

export function PictureCard({ event }: PictureCardProps) {
  const author = useAuthor(event.pubkey);
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const displayName = metadata?.display_name || metadata?.name || genUserName(event.pubkey);
  const profileImage = metadata?.picture;
  const title = event.tags.find(([name]) => name === 'title')?.[1] || '';
  const images = parseImetaTags(event);
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{displayName}</CardTitle>
            <CardDescription className="text-xs">
              {new Date(event.created_at * 1000).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Image carousel */}
        <div className="relative">
          <AspectRatio ratio={1}>
            <img
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt || title || 'Picture'}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </AspectRatio>

          {/* Navigation buttons for multiple images */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={prevImage}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={nextImage}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content section */}
        <div className="p-4 space-y-3">
          {title && (
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          )}

          {event.content && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {event.content}
            </p>
          )}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
