import React, { useMemo } from 'react';
import { useProfile } from "nostr-react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '@/components/ui/avatar';
import NIP05 from '@/components/nip05';
import { nip19 } from "nostr-tools";
import Link from 'next/link';
import { Button } from './ui/button';
import { ImStatsDots } from "react-icons/im";
import FollowButton from './FollowButton';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from './ui/input';
import { Share1Icon } from '@radix-ui/react-icons';
import { toast } from './ui/use-toast';

interface ProfileInfoCardProps {
  pubkey: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = React.memo(({ pubkey }) => {

  let userPubkey = '';
  let host = '';
  if (typeof window !== 'undefined') {
    userPubkey = window.localStorage.getItem('pubkey') ?? '';
    host = window.location.host;
  }

  const { data: userData, isLoading } = useProfile({ pubkey });

  const npubShortened = useMemo(() => {
    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    return 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
  }, [pubkey]);

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
  const description = userData?.about?.replace(/(?:\r\n|\r|\n)/g, '<br>');
  const nip05 = userData?.nip05;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(host+"/profile/"+nip19.npubEncode(pubkey));
      toast({
        description: 'URL copied to clipboard',
        title: 'Copied'
      });
    } catch (err) {
      toast({
        description: 'Error copying URL to clipboard',
        title: 'Error',
        variant: 'destructive'
      });
    }
  };

  const handleCopyPublicKey = async () => {
    try {
      await navigator.clipboard.writeText(nip19.npubEncode(pubkey));
      toast({
        description: 'PublicKey copied to clipboard',
        title: 'Copied'
      });
    } catch (err) {
      toast({
        description: 'Error copying PublicKey to clipboard',
        title: 'Error',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='py-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            <Link href={`/profile/${nip19.npubEncode(pubkey)}`}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar className='mr-2'>
                  <AvatarImage src={userData?.picture} alt={title} />
                </Avatar>
                {title}
              </div>
            </Link>
          </CardTitle>
          <div>
            <NIP05 nip05={nip05?.toString() ?? ''} pubkey={pubkey} />
            <div className='py-6 grid grid-cols-5 gap-4'>
              {/* <Button className='w-full'>Follow</Button> */}
              <div className='col-span-2'>
                <FollowButton pubkey={pubkey} userPubkey={userPubkey}></FollowButton>
              </div>
              <Link className='col-span-2' href={`/dashboard/${nip19.npubEncode(pubkey)}`}>
                <Button className='w-full' variant="outline">View Statistics</Button>
              </Link>
              <Drawer>
                <DrawerTrigger>
                  <Button className='w-full' variant="outline"><Share1Icon /></Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Share this Profile</DrawerTitle>
                    <DrawerDescription>Share this Profile with others.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-2">
                    {/* <h1>URL</h1> */}
                    <div className="flex items-center mb-4">
                      <Input value={host+"/profile/"+nip19.npubEncode(pubkey)} disabled className="mr-2" />
                      <Button variant="outline" onClick={handleCopyLink}>Copy Link</Button>
                    </div>
                    <div className="flex items-center mb-4">
                      <Input value={nip19.npubEncode(pubkey)} disabled className="mr-2" />
                      <Button variant="outline" onClick={handleCopyPublicKey}>Copy PublicKey</Button>
                    </div>
                  </div>
                  <DrawerFooter>
                    <DrawerClose>
                      <Button variant="outline">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
            <hr />
          </div>
        </CardHeader>
        <CardContent>
          <div className='break-words' dangerouslySetInnerHTML={{ __html: description ?? '' }} />
        </CardContent>
      </Card>
    </div>
  );
});

ProfileInfoCard.displayName = 'ProfileInfoCard';

export default ProfileInfoCard;