import { useAuthor } from '@/hooks/useAuthor';
import { useUserPictures } from '@/hooks/useUserPictures';
import { useUserNotes } from '@/hooks/useUserNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Image, FileText } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AdaptivePictureCard } from '@/components/feed/AdaptivePictureCard';
import { NoteCard } from '@/components/feed/NoteCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export function ProfileView({ pubkey }: { pubkey: string }) {
  const [activeTab, setActiveTab] = useState('pictures');
  const author = useAuthor(pubkey);
  
  const pictures = useUserPictures(pubkey);
  const notes = useUserNotes(pubkey);

  const picturesData = pictures.data?.pages.flat() || [];
  const notesData = notes.data?.pages.flat() || [];

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          pubkey={pubkey}
          metadata={author.data?.metadata}
          isLoading={author.isLoading}
        />

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pictures" className="flex items-center justify-center gap-2">
              <Image className="h-5 w-5" />
              <span className="hidden sm:inline">Pictures</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
          </TabsList>

          {/* Pictures Tab */}
          <TabsContent value="pictures" className="mt-6">
            {pictures.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : picturesData.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <p className="text-muted-foreground">
                    No pictures found for this user.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {picturesData.map((event) => (
                    <AdaptivePictureCard key={event.id} event={event} />
                  ))}
                </div>

                {pictures.hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => pictures.fetchNextPage()}
                      disabled={pictures.isFetchingNextPage}
                      variant="outline"
                      size="lg"
                    >
                      {pictures.isFetchingNextPage ? (
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
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            {notes.isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : notesData.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <p className="text-muted-foreground">
                    No notes found for this user.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {notesData.map((event) => (
                    <NoteCard key={event.id} event={event} />
                  ))}
                </div>

                {notes.hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => notes.fetchNextPage()}
                      disabled={notes.isFetchingNextPage}
                      variant="outline"
                      size="lg"
                    >
                      {notes.isFetchingNextPage ? (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
