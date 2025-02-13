import React from 'react';
import { useProfile } from "@/hooks/useNDK";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { nip19 } from "nostr-tools";

interface RecentFollowerCardProps {
  followers: any[];
}

export function RecentFollowerCard({ followers }: RecentFollowerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Followers</CardTitle>
      </CardHeader>
      <CardContent>
        {followers.map((follower) => {
          const { data: userData } = useProfile(follower.pubkey);
          const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || nip19.npubEncode(follower.pubkey);
          const profileImageSrc = userData?.image || "https://robohash.org/" + follower.pubkey;
          const createdAt = new Date(follower.created_at * 1000);
          const hrefProfile = `/profile/${nip19.npubEncode(follower.pubkey)}`;

          return (
            <div key={follower.id} className="flex items-center space-x-2 py-2">
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
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}