import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { usePictureFeed } from '@/hooks/usePictureFeed';
import { PictureCard } from '@/components/feed/PictureCard';
import { useInView } from 'react-intersection-observer';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  useSeoMeta({
    title: 'Picture Feed - LUMINA',
    description: 'Discover amazing pictures shared on Nostr.',
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePictureFeed();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Remove duplicate events by ID
  const pictures = useMemo(() => {
    const seen = new Set<string>();
    return data?.pages.flat().filter(event => {
      if (!event.id || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    }) || [];
  }, [data?.pages]);

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Picture Feed</h1>
          <p className="text-muted-foreground">
            Discover amazing pictures shared on Nostr
          </p>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))
          ) : pictures.length === 0 ? (
            // Empty state
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-4">
                  <p className="text-muted-foreground">
                    No pictures found yet. Try checking your relay connections or wait a moment for content to load.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Picture feed
            <>
              {pictures.map((picture) => (
                <PictureCard key={picture.id} event={picture} />
              ))}

              {/* Infinite scroll trigger */}
              {hasNextPage && (
                <div ref={ref} className="py-4">
                  {isFetchingNextPage && (
                    <Card className="overflow-hidden">
                      <div className="p-4 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="w-full aspect-square" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
