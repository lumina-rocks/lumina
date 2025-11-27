import { Layout } from '@/components/Layout';
import { usePopularHashtags } from '@/hooks/usePopularHashtags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Hashtags() {
  const { data: hashtags, isLoading, isError } = usePopularHashtags(9);
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Popular Hashtags</h1>
            <p className="text-muted-foreground">
              Discover trending topics and explore content by hashtag
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-20" />
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
                    Failed to load hashtags. Try checking your relay connections or wait a moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && hashtags && hashtags.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <Hash className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No hashtags found yet. Be the first to add hashtags to your pictures!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && hashtags && hashtags.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hashtags.map(({ tag, count }) => (
                <Card
                  key={tag}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => navigate(`/tag/${encodeURIComponent(tag)}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Hash className="w-5 h-5 text-primary" />
                      <span className="truncate">{tag}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-sm">
                      {count} {count === 1 ? 'post' : 'posts'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
