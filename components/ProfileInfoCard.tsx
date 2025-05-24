import React, { useMemo } from 'react';
import { useProfile, useNostrEvents } from "nostr-react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '@/components/ui/avatar';
import NIP05 from '@/components/nip05';
import { nip19, type Event as NostrEvent } from "nostr-tools";
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
import { Share1Icon, LightningBoltIcon, GlobeIcon } from '@radix-ui/react-icons';
import { toast } from './ui/use-toast';
import { Globe, UserCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import { MusicIcon, ActivityIcon } from 'lucide-react';

// NIP-38 Status types
const STATUS_TYPES = {
  GENERAL: 'general',
  MUSIC: 'music'
};

interface ProfileInfoCardProps {
  pubkey: string;
}

interface StatusMap {
  [key: string]: NostrEvent;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = React.memo(({ pubkey }) => {

  let userPubkey = '';
  let host = '';
  if (typeof window !== 'undefined') {
    userPubkey = window.localStorage.getItem('pubkey') ?? '';
    host = window.location.host;
  }

  const { data: userData, isLoading } = useProfile({ pubkey });
  
  // Fetch user status events (NIP-38)
  const { events: statusEvents } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [30315], // NIP-38 user status event kind
      limit: 1,
    },
  });

  // Fetch follow list (NIP-02) to check if profile owner follows the logged-in user
  const { events: followListEvents } = useNostrEvents({
    filter: {
      authors: [pubkey],
      kinds: [3], // NIP-02 follow list event kind
      limit: 1,
    },
    enabled: !!userPubkey, // Only fetch if a user is logged in
  });

  // Check if the profile owner follows the logged-in user
  const isFollowingUser = useMemo(() => {
    if (!userPubkey || followListEvents.length === 0) return false;
    
    const followList = followListEvents[0];
    if (!followList) return false;
    
    // Look for a 'p' tag with the logged-in user's pubkey
    return followList.tags.some(tag => tag[0] === 'p' && tag[1] === userPubkey);
  }, [followListEvents, userPubkey]);

  // Get the latest status events by type
  const userStatuses = useMemo(() => {
    const statuses: StatusMap = {};
    
    // Process status events
    for (const event of statusEvents) {
      const dTag = event.tags.find(tag => tag[0] === 'd');
      if (!dTag || !dTag[1]) continue;
      
      const statusType = dTag[1];
      
      // Check if event has expiration
      const expirationTag = event.tags.find(tag => tag[0] === 'expiration');
      if (expirationTag && expirationTag[1]) {
        const expirationTime = parseInt(expirationTag[1]);
        const now = Math.floor(Date.now() / 1000);
        
        // Skip expired statuses
        if (expirationTime < now) continue;
      }
      
      // Set/update status (most recent one for the type)
      if (!statuses[statusType] || statuses[statusType].created_at < event.created_at) {
        statuses[statusType] = event;
      }
    }
    
    return statuses;
  }, [statusEvents]);

  const npubShortened = useMemo(() => {
    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    return 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
  }, [pubkey]);

  const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
  const description = userData?.about?.replace(/(?:\r\n|\r|\n)/g, '<br>');
  const nip05 = userData?.nip05;
  const lightningAddress = userData?.lud16;
  const website = userData?.website;

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

  const handleCopyLightningAddress = async () => {
    if (!lightningAddress) return;
    
    try {
      await navigator.clipboard.writeText(lightningAddress);
      toast({
        description: 'Lightning Address copied to clipboard',
        title: 'Copied'
      });
    } catch (err) {
      toast({
        description: 'Error copying Lightning Address to clipboard',
        title: 'Error',
        variant: 'destructive'
      });
    }
  };

  const handleOpenWebsite = () => {
    if (!website) return;
    
    // Add https:// prefix if not present
    let url = website;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    window.open(url, '_blank');
  };

  // Get reference URL from status event
  const getStatusReference = (event: NostrEvent): string | null => {
    const refTag = event.tags.find(tag => tag[0] === 'r');
    return refTag ? refTag[1] : null;
  };

  // Render user status component
  const renderUserStatus = () => {
    const generalStatus = userStatuses[STATUS_TYPES.GENERAL];
    const musicStatus = userStatuses[STATUS_TYPES.MUSIC];
    
    if (!generalStatus && !musicStatus) return null;
    
    return (
      <div className="flex flex-col gap-2 my-3">
        {generalStatus && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-3 text-sm font-normal bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <ActivityIcon size={16} className="text-primary" />
            <span>{generalStatus.content}</span>
            {getStatusReference(generalStatus) && (
              <Link href={getStatusReference(generalStatus) as string} target="_blank" className="text-primary hover:underline ml-1 text-xs">
                Link
              </Link>
            )}
          </Badge>
        )}
        
        {musicStatus && (
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-3 text-sm font-normal bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <MusicIcon size={16} className="text-primary" />
            <span className="italic">{musicStatus.content}</span>
            {getStatusReference(musicStatus) && (
              <Link href={getStatusReference(musicStatus) as string} target="_blank" className="text-primary hover:underline ml-1 text-xs">
                Listen
              </Link>
            )}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className='py-2'>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className={`h-24 w-24 ${userPubkey && userPubkey !== pubkey && isFollowingUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                <AvatarImage className="object-cover w-full h-full" src={userData?.picture} alt={title} />
              </Avatar>
              {userPubkey && userPubkey !== pubkey && isFollowingUser && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1" title="Follows you">
                  <UserCheck className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Link href={`/profile/${nip19.npubEncode(pubkey)}`}>
                <div className="text-2xl">{title}</div>
              </Link>
              <div className="text-sm text-muted-foreground">
                <NIP05 nip05={nip05?.toString() ?? ''} pubkey={pubkey} />
              </div>
              {lightningAddress && (
                <div className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-purple-400 transition-colors" onClick={handleCopyLightningAddress}>
                  <LightningBoltIcon className="h-4 w-4 text-yellow-500" />
                  <span>{lightningAddress}</span>
                </div>
              )}
              {website && (
                <div className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-purple-400 transition-colors" onClick={handleOpenWebsite}>
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span>{website}</span>
                </div>
              )}
              {renderUserStatus()}
            </div>
          </div>
          <div>
            <div className='py-6 grid grid-cols-5 gap-4'>
              <div className='col-span-2'>
                <FollowButton pubkey={pubkey} userPubkey={userPubkey}></FollowButton>
              </div>
              <Link className='col-span-2' href={`/dashboard/${nip19.npubEncode(pubkey)}`}>
                <Button className='w-full' variant="outline">View Statistics</Button>
              </Link>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button className='w-full' variant="outline"><Share1Icon /></Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Share this Profile</DrawerTitle>
                    <DrawerDescription>Share this Profile with others.</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-2">
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
                    <DrawerClose asChild>
                      <div>
                        <Button variant="outline">Close</Button>
                      </div>
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