import { useEffect, useMemo } from 'react';
import { useSeoMeta } from '@unhead/react';
import { useInView } from 'react-intersection-observer';
import { Layout } from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { LoginArea } from '@/components/auth/LoginArea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export function Notifications() {
  useSeoMeta({
    title: 'Notifications - LUMINA',
    description: 'View your notifications on LUMINA.',
  });

  const { user } = useCurrentUser();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Remove duplicate events by ID
  const notifications = useMemo(() => {
    const seen = new Set<string>();
    return data?.pages.flat().filter(event => {
      if (!event.id || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    }) || [];
  }, [data?.pages]);

  // Show login prompt for logged-out users
  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Login to view notifications</h2>
                    <p className="text-muted-foreground">
                      Sign in to see reactions, comments, and zaps on your content.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <LoginArea className="max-w-60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-16 w-16 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : notifications.length === 0 ? (
              // Empty state
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Bell className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No notifications yet</h3>
                      <p className="text-muted-foreground">
                        When others interact with your pictures, you'll see notifications here.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Notifications feed
              <>
                {notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={ref} className="py-4">
                    {isFetchingNextPage && (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                  </div>
                                  <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-16 w-16 rounded-md" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
