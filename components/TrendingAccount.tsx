import React from 'react';
import { useProfile } from "nostr-react";
import {
  nip19,
} from "nostr-tools";
import {
  Card,
  CardHeader,
  CardTitle,
  SmallCardContent,
} from "@/components/ui/card"
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useProfileValue } from '@nostr-dev-kit/ndk-hooks';

interface TrendingAccountProps {
  pubkey: string;
}

const TrendingAccount: React.FC<TrendingAccountProps> = ({ pubkey }) => {
  const userData = useProfileValue(pubkey);

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || nip19.npubEncode(pubkey);
  const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
  const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <Link href={hrefProfile} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar>
                  <AvatarImage src={profileImageSrc} />
                </Avatar>
                {/* <span style={{ marginLeft: '10px' }}>{title.substring(0, 12)}</span> */}
                <span className='break-all' style={{ marginLeft: '10px' }}>{title}</span>
              </div>
            </Link>
          </CardTitle>
        </CardHeader>
        <SmallCardContent>
          <div>
            <div className='d-flex justify-content-center align-items-center'>
            </div>
          </div>
        </SmallCardContent>
      </Card>
    </>
  );
}

export default TrendingAccount;