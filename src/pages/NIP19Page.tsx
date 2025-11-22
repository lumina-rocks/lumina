import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { MinimalPictureCard } from '@/components/feed/MinimalPictureCard';
import { useAuthor } from '@/hooks/useAuthor';
import { useUserPictures } from '@/hooks/useUserPictures';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import NotFound from './NotFound';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type, data } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile': {
      // Extract pubkey from decoded data
      const pubkey = type === 'npub' ? data : data.pubkey;
      
      return (
        <Layout>
          <ProfileView pubkey={pubkey} />
        </Layout>
      );
    }

    case 'note':
      // AI agent should implement note view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Note placeholder
            </div>
          </div>
        </Layout>
      );

    case 'nevent':
      // AI agent should implement event view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Event placeholder
            </div>
          </div>
        </Layout>
      );

    case 'naddr':
      // AI agent should implement addressable event view here
      return (
        <Layout>
          <div className="container py-8">
            <div className="max-w-2xl mx-auto">
              Addressable event placeholder
            </div>
          </div>
        </Layout>
      );

    default:
      return <NotFound />;
  }
}

function ProfileView({ pubkey }: { pubkey: string }) {
  const author = useAuthor(pubkey);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useUserPictures(pubkey);

  const pictures = data?.pages.flat() || [];

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          pubkey={pubkey}
          metadata={author.data?.metadata}
          isLoading={author.isLoading}
        />

        {/* Pictures Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pictures</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : pictures.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground">
                  No pictures found for this user.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pictures.map((event) => (
                  <MinimalPictureCard key={event.id} event={event} />
                ))}
              </div>

              {hasNextPage && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    size="lg"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}