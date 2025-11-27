import { Layout } from '@/components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useHashtagFeed } from '@/hooks/useHashtagFeed';
import { AdaptivePictureCard } from '@/components/feed/AdaptivePictureCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Hash, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useCallback } from 'react';

export function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const decodedTag = tag ? decodeURIComponent(tag) : '';

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHashtagFeed(decodedTag);

  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const pictures = data?.pages.flat() ?? [];

  if (!tag) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">Invalid hashtag</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <Hash className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">{decodedTag}</h1>
            </div>
            <p className="text-muted-foreground">
              Browse all pictures tagged with #{decodedTag}
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isError && (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <p className="text-muted-foreground">
                    Failed to load pictures. Try checking your relay connections or wait a moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && pictures.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <Hash className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No pictures found with #{decodedTag}. Be the first to post one!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && pictures.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pictures.map((picture) => (
                  <AdaptivePictureCard key={picture.id} event={picture} />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-10 mt-8">
                {isFetchingNextPage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <Skeleton className="aspect-square w-full" />
                        <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
