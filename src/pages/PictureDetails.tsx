import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { usePictureEvent } from '@/hooks/usePictureEvent';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { ReactionButton } from '@/components/ReactionButton';
import { ZapButton } from '@/components/ZapButton';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { NoteContent } from '@/components/NoteContent';

interface PictureDetailsProps {
  eventId: string;
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

function PictureDetailsContent({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

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

  const goToProfile = () => {
    const npub = nip19.npubEncode(event.pubkey);
    navigate(`/${npub}`);
  };

  if (images.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <p className="text-muted-foreground">No images found in this event.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={goToProfile}>
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-lg truncate cursor-pointer hover:underline" 
                onClick={goToProfile}
              >
                {displayName}
              </CardTitle>
              <CardDescription className="text-sm">
                {new Date(event.created_at * 1000).toLocaleString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Image carousel */}
          <div className="relative bg-black">
            <div className="max-w-full mx-auto">
              <img
                src={images[currentImageIndex].url}
                alt={images[currentImageIndex].alt || title || 'Picture'}
                className="object-contain w-full max-h-[70vh] mx-auto"
                loading="eager"
              />
            </div>

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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content section */}
          <div className="p-6 space-y-4">
            {title && (
              <h1 className="font-bold text-2xl leading-tight">{title}</h1>
            )}

            {event.content && (
              <div className="text-base whitespace-pre-wrap break-words">
                <NoteContent event={event} />
              </div>
            )}

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Interaction buttons */}
            <div className="flex items-center gap-2 pt-2">
              <ReactionButton target={event} showCount buttonVariant="ghost" />
              <ZapButton target={event} showCount buttonVariant="ghost" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments section */}
      <CommentsSection root={event} />
    </div>
  );
}

export function PictureDetails({ eventId }: PictureDetailsProps) {
  const { data: event, isLoading } = usePictureEvent(eventId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="w-full h-[70vh]" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <p className="text-muted-foreground">Picture not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <PictureDetailsContent event={event} />;
}
