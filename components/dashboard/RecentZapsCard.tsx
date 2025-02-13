import React from 'react';
import { useProfile } from "@/hooks/useNDK";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { nip19 } from "nostr-tools";

interface RecentZapsCardProps {
  zaps: any[];
}

export function RecentZapsCard({ zaps }: RecentZapsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Zaps</CardTitle>
      </CardHeader>
      <CardContent>
        {zaps.map((zap) => {
          const { data: userData } = useProfile(zap.pubkey);
          const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || nip19.npubEncode(zap.pubkey);
          const profileImageSrc = userData?.image || "https://robohash.org/" + zap.pubkey;
          const createdAt = new Date(zap.created_at * 1000);
          const hrefProfile = `/profile/${nip19.npubEncode(zap.pubkey)}`;

          return (
            <div key={zap.id} className="flex items-center space-x-2 py-2"></div>
              <Link href={hrefProfile} style={{ textDecoration: 'none' }}>
                <Avatar>
                  <AvatarImage src={profileImageSrc} alt={title} />
                </Avatar>
              </Link>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{title}</p>
                <p className="text-sm text-muted-foreground">
                  {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
                </p>
                <p className="text-sm text-muted-foreground">{zap.sats} sats</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}