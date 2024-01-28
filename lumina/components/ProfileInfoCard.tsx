import React from 'react';
import { useProfile } from "nostr-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';

interface ProfileInfoCardProps {
  pubkey: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ pubkey }) => {
  const { data: userData } = useProfile({
    pubkey,
  });

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub;
  const description = userData?.about?.replace(/(?:\r\n|\r|\n)/g, '<br>');
  return (
    <>
      <h2>{title}</h2>
      <div className='py-6'>
        {description ? (
          <Card>
            <CardContent><div className='pt-6' dangerouslySetInnerHTML={{ __html: description }} ></div></CardContent>
          </Card>
        ) : (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] rounded-xl" />
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileInfoCard;