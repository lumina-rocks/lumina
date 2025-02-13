import React from 'react';
import { useNostrEvents, useProfile } from "@/hooks/useNDK";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '@/components/ui/avatar';
import NIP05 from '@/components/nip05';
import { RecentFollowerCard } from './RecentFollowerCard';
import {
    nip19,
} from "nostr-tools";
import { RecentZapsCard } from './RecentZapsCard';

interface ProfileInfoCardProps {
    pubkey: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ pubkey }) => {
    const { data: userData } = useProfile(pubkey);

    const { events: followers } = useNostrEvents({
        filter: {
            kinds: [3],
            '#p': [pubkey],
        },
    });

    const { events: zaps } = useNostrEvents({
        filter: {
            kinds: [9735],
            '#p': [pubkey],
            limit: 50,
        },
    });

    const { events: following } = useNostrEvents({
        filter: {
            kinds: [3],
            authors: [pubkey],
            limit: 1,
        },
    });

    // Filter for only new followings (latest in a users followers list)
    const filteredFollowers = followers.filter(follower => {
        const lastPTag = follower.tags[follower.tags.length - 1];
        return lastPTag?.[0] === "p" && lastPTag[1] === pubkey.toString();
    });

    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    let npubShortened = 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
    const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || npubShortened;
    const description = userData?.about?.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const nip05 = userData?.nip05;
    let profileImageSrc = userData?.image || "https://robohash.org/" + pubkey;

    return (
        <>
            <div className='pt-6 px-6'>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">
                            Following
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {following[0]?.tags.length || "-"}
                        </div>
                    </CardContent>
                </Card>
                <RecentFollowerCard followers={filteredFollowers.reverse()} />
                <RecentZapsCard zaps={zaps.reverse() ?? []} />
            </div>
        </>
    );
}

export default ProfileInfoCard;