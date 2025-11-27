import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Hash, AtSign, User, Loader2, AlertCircle } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { verifyAndGetPubkey, isNIP05Format } from '@/lib/nip05';
import { nip19 } from 'nostr-tools';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

interface SearchResultItemProps {
  event: NostrEvent;
  onClick: () => void;
}

function SearchResultItem({ event, onClick }: SearchResultItemProps) {
  const author = useAuthor(event.pubkey);
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const displayName = metadata?.name || genUserName(event.pubkey);
  const npub = nip19.npubEncode(event.pubkey);

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={metadata?.picture} alt={displayName} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{displayName}</p>
              {metadata?.nip05 && (
                <Badge variant="outline" className="text-xs">
                  {metadata.nip05}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {npub.substring(0, 16)}...
            </p>
            {metadata?.about && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {metadata.about}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isVerifyingNIP05, setIsVerifyingNIP05] = useState(false);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle NIP-05 verification and redirect
  useEffect(() => {
    async function handleNIP05() {
      if (!debouncedQuery || !isNIP05Format(debouncedQuery)) {
        return;
      }

      setIsVerifyingNIP05(true);
      const pubkey = await verifyAndGetPubkey(debouncedQuery);
      setIsVerifyingNIP05(false);

      if (pubkey) {
        const npub = nip19.npubEncode(pubkey);
        navigate(`/${npub}`);
      }
    }

    handleNIP05();
  }, [debouncedQuery, navigate]);

  // Handle hashtag redirect
  useEffect(() => {
    if (debouncedQuery.startsWith('#') && debouncedQuery.length > 1) {
      const tag = debouncedQuery.substring(1);
      navigate(`/tag/${encodeURIComponent(tag)}`);
    }
  }, [debouncedQuery, navigate]);

  // Determine search mode
  const isHashtag = searchInput.startsWith('#');
  const isNIP05Search = isNIP05Format(searchInput);
  const isUsernameSearch = searchInput.startsWith('@') && searchInput.length > 1;

  // Only do NIP-50 search for @username queries
  const shouldSearch = isUsernameSearch && !isHashtag && !isNIP05Search;
  const searchQuery = isUsernameSearch ? searchInput.substring(1) : searchInput;

  const { data: searchResults, isLoading } = useSearch({
    query: shouldSearch ? searchQuery : '',
    kinds: [0], // Search profiles for @username
    limit: 20,
  });

  const handleResultClick = (pubkey: string) => {
    const npub = nip19.npubEncode(pubkey);
    navigate(`/${npub}`);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Search className="h-8 w-8" />
              Search
            </h1>
            <p className="text-muted-foreground">
              Search for users, hashtags, or NIP-05 identifiers
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="@username, #hashtag, or name@domain.com"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
              autoFocus
            />
          </div>

          {/* Search Type Hints */}
          {searchInput.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {isHashtag && (
                <Badge variant="secondary" className="gap-1">
                  <Hash className="h-3 w-3" />
                  Hashtag - will redirect to tag page
                </Badge>
              )}
              {isNIP05Search && (
                <Badge variant="secondary" className="gap-1">
                  <AtSign className="h-3 w-3" />
                  NIP-05 - verifying and redirecting...
                </Badge>
              )}
              {isUsernameSearch && !isNIP05Search && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  Username search (NIP-50)
                </Badge>
              )}
            </div>
          )}

          {/* Loading State for NIP-05 */}
          {isVerifyingNIP05 && (
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">
                  Verifying NIP-05 identifier...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {shouldSearch && !isVerifyingNIP05 && (
            <>
              {isLoading && (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && searchResults && searchResults.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No users found matching "{searchQuery}". Try a different search term or check your relay connections.
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && searchResults && searchResults.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </h2>
                  {searchResults.map((event) => (
                    <SearchResultItem
                      key={event.id}
                      event={event}
                      onClick={() => handleResultClick(event.pubkey)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Instructions */}
          {!searchInput && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Search Tips</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">@username</p>
                    <p className="text-sm text-muted-foreground">
                      Search for users by name or display name using NIP-50 relay search
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">#hashtag</p>
                    <p className="text-sm text-muted-foreground">
                      Browse content tagged with a specific hashtag
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AtSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">name@domain.com</p>
                    <p className="text-sm text-muted-foreground">
                      Verify and navigate to a user's profile via NIP-05 identifier
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
