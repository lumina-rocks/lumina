import { useReactions } from '@/hooks/useReactions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Heart, Loader2Icon } from 'lucide-react';
import type { Event } from 'nostr-tools';
import { Button } from './ui/button';
import { useToast } from '@/hooks/useToast';

interface ReactionButtonProps {
  target: Event;
  className?: string;
  showCount?: boolean;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  reactionData?: { count: number; userHasReacted: boolean; isLoading?: boolean };
}

export function ReactionButton({
  target,
  className = "text-xs ml-1",
  showCount = true,
  buttonVariant = "outline",
  reactionData: externalReactionData
}: ReactionButtonProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: createEvent, isPending: isPublishing } = useNostrPublish();

  // Only fetch data if not provided externally
  const { reactionCount: fetchedCount, userHasReacted: fetchedHasReacted, isLoading } = useReactions(
    externalReactionData ? [] : target ?? [] // Empty array prevents fetching if external data provided
  );

  // Don't show reaction button if user is not logged in
  if (!user || !target) {
    return null;
  }

  // Use external data if provided, otherwise use fetched data
  const reactionCount = externalReactionData?.count ?? fetchedCount;
  const userHasReacted = externalReactionData?.userHasReacted ?? fetchedHasReacted;
  const showLoading = externalReactionData?.isLoading || isLoading;

  const handleReaction = () => {
    if (!user || isPublishing) return;

    // Build tags according to NIP-25
    const tags: string[][] = [];

    // Add e tag (required) - target event id with relay hint
    tags.push(['e', target.id, '', target.pubkey]);

    // Add p tag (should be present) - target event author
    tags.push(['p', target.pubkey, '']);

    // Add k tag (may be present) - kind of the reacted event
    tags.push(['k', String(target.kind)]);

    // If addressable event, add a tag
    if (target.kind >= 30000 && target.kind < 40000) {
      const identifier = target.tags.find((t) => t[0] === 'd')?.[1] || '';
      tags.push(['a', `${target.kind}:${target.pubkey}:${identifier}`, '']);
    }

    createEvent(
      {
        kind: 7,
        content: '+', // "+" indicates a like/upvote
        tags,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Reaction sent',
            description: userHasReacted ? 'Your reaction was updated' : 'Your reaction was sent successfully',
          });
        },
        onError: (error) => {
          toast({
            title: 'Failed to send reaction',
            description: error instanceof Error ? error.message : 'An error occurred',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Button
      variant={buttonVariant}
      className={`flex items-center gap-1 ${className}`}
      onClick={handleReaction}
      disabled={isPublishing}
    >
      <Heart className={`h-4 w-4 ${userHasReacted ? 'fill-current text-red-500' : ''}`} />
      <span className="text-xs">
        {showLoading || isPublishing ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : showCount && reactionCount > 0 ? (
          `${reactionCount.toLocaleString()}`
        ) : (
          ''
        )}
      </span>
    </Button>
  );
}
