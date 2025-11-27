import { Link, useNavigate } from 'react-router-dom';
import { nip19, nip57 } from 'nostr-tools';
import { Heart, MessageSquare, Zap, AtSign } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { usePictureEvent } from '@/hooks/usePictureEvent';
import { genUserName } from '@/lib/genUserName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationEvent } from '@/hooks/useNotifications';
import { NoteContent } from '@/components/NoteContent';

interface NotificationCardProps {
  notification: NotificationEvent;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const author = useAuthor(notification.pubkey);
  const navigate = useNavigate();
  
  // Fetch the target picture if this notification references one
  const { data: targetPicture } = usePictureEvent(notification.targetEventId || '');
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(notification.pubkey);
  const profileImage = metadata?.picture;
  const npub = nip19.npubEncode(notification.pubkey);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at * 1000), { addSuffix: true });

  // Get notification icon and label
  const getNotificationInfo = () => {
    switch (notification.notificationType) {
      case 'reaction':
        return {
          icon: <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
          label: 'liked your picture',
          color: 'text-red-500'
        };
      case 'comment':
        return {
          icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
          label: 'commented on your picture',
          color: 'text-blue-500'
        };
      case 'zap':
        // Extract amount from zap
        const bolt11Tag = notification.tags.find(([name]) => name === 'bolt11')?.[1];
        let amount = '';
        if (bolt11Tag) {
          try {
            const sats = nip57.getSatoshisAmountFromBolt11(bolt11Tag);
            amount = ` ${sats} sats`;
          } catch {
            // Fallback if parsing fails
          }
        }
        return {
          icon: <Zap className="h-4 w-4 fill-yellow-500 text-yellow-500" />,
          label: `zapped your picture${amount}`,
          color: 'text-yellow-500'
        };
      case 'mention':
        return {
          icon: <AtSign className="h-4 w-4 text-purple-500" />,
          label: 'mentioned you',
          color: 'text-purple-500'
        };
      default:
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          label: 'interacted with your content',
          color: 'text-muted-foreground'
        };
    }
  };

  const notificationInfo = getNotificationInfo();

  // Get the target picture thumbnail if available
  const targetImageUrl = targetPicture?.tags.find(([name]) => name === 'url')?.[1] ||
                         targetPicture?.tags.find(([name]) => name === 'image')?.[1];

  const handleClick = () => {
    // Navigate to the target event or the notification event itself
    if (notification.targetEventId && targetPicture) {
      const nevent = nip19.neventEncode({ 
        id: notification.targetEventId,
        author: targetPicture.pubkey 
      });
      navigate(`/${nevent}`);
    } else {
      const nevent = nip19.neventEncode({ 
        id: notification.id,
        author: notification.pubkey 
      });
      navigate(`/${nevent}`);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Link 
            to={`/${npub}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <Avatar className="h-10 w-10 hover:ring-2 hover:ring-primary/30 transition-all">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/${npub}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold hover:underline"
              >
                {displayName}
              </Link>
              <span className="text-sm text-muted-foreground">{notificationInfo.label}</span>
              <span className={`${notificationInfo.color}`}>{notificationInfo.icon}</span>
            </div>

            {/* Show comment content if it's a comment */}
            {notification.notificationType === 'comment' && notification.content && (
              <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                <NoteContent event={notification} className="text-sm" />
              </div>
            )}

            {/* Show mention content if it's a mention */}
            {notification.notificationType === 'mention' && notification.content && (
              <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                <NoteContent event={notification} className="text-sm" />
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
          </div>

          {/* Target Picture Thumbnail */}
          {targetImageUrl && (
            <div className="shrink-0">
              <img
                src={targetImageUrl}
                alt="Target picture"
                className="h-16 w-16 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
