import type { NostrMetadata } from '@nostrify/nostrify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { genUserName } from '@/lib/genUserName';
import { NIP05Verification } from '@/components/profile/NIP05Verification';
import { LightningBadge } from '@/components/profile/LightningBadge';

interface ProfileHeaderProps {
  pubkey: string;
  metadata?: NostrMetadata;
  isLoading?: boolean;
}

export function ProfileHeader({ pubkey, metadata, isLoading }: ProfileHeaderProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-32 w-32 rounded-full mx-auto md:mx-0" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const userName = metadata?.name;
  const about = metadata?.about;
  const picture = metadata?.picture;
  const nip05 = metadata?.nip05;
  const lud06 = metadata?.lud06;
  const lud16 = metadata?.lud16;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <Avatar className="h-32 w-32">
              <AvatarImage src={picture} alt={displayName} />
              <AvatarFallback className="text-3xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {/* Name and Username */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              {userName && displayName !== userName && (
                <p className="text-muted-foreground">@{userName}</p>
              )}
            </div>

            {/* Badges: NIP-05 and Lightning */}
            <div className="flex flex-wrap gap-2">
              {nip05 && (
                <NIP05Verification nip05={nip05} pubkey={pubkey} />
              )}
              <LightningBadge lud06={lud06} lud16={lud16} />
            </div>

            {/* About */}
            {about && (
              <p className="text-muted-foreground whitespace-pre-wrap break-words">
                {about}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
