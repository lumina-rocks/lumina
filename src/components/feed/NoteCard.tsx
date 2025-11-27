import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { ReactionButton } from '@/components/ReactionButton';
import { ZapButton } from '@/components/ZapButton';
import { NoteContent } from '@/components/NoteContent';

interface NoteCardProps {
  event: NostrEvent;
}

export function NoteCard({ event }: NoteCardProps) {
  const author = useAuthor(event.pubkey);
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const navigate = useNavigate();

  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const profileImage = metadata?.picture;
  const npub = nip19.npubEncode(event.pubkey);
  const nevent = nip19.neventEncode({ id: event.id, author: event.pubkey });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'A'
    ) {
      return;
    }
    navigate(`/${nevent}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${npub}`);
              }}
            >
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${npub}`);
                }}
                className="font-semibold hover:underline text-left"
              >
                {displayName}
              </button>
              <p className="text-sm text-muted-foreground">
                {formatTimestamp(event.created_at)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2 space-y-4">
        <NoteContent event={event} className="text-sm" />
        <hr />
        <div className="flex items-center gap-2 pb-2">
          <ReactionButton target={event} buttonVariant='ghost'/>
          <ZapButton target={event} buttonVariant='ghost'/>
        </div>
      </CardContent>
    </Card>
  );
}
