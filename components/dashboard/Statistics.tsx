import React from 'react';
import { useNostrEvents, useProfile } from "nostr-react";
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
    var lightningPayReq = require('bolt11');

    const { data: userData, isLoading: userDataLoading } = useProfile({
        pubkey,
    });

    const { events: followers, isLoading: followersLoading } = useNostrEvents({
        filter: {
            kinds: [3],
            '#p': [pubkey],
        },
    });

    const { events: zapsReceived, isLoading: zapsReceivedLoading } = useNostrEvents({
        filter: {
            kinds: [9735],
            '#p': [pubkey],
        },
    });

    const { events: zapsSent, isLoading: zapsSentLoading } = useNostrEvents({
        filter: {
            kinds: [9735],
            authors: [pubkey],
        },
    });

    let satsReceived = 0;
    zapsReceived.forEach((event) => {
        event.tags.forEach((tag) => {
            if (tag[0] === 'bolt11') {
                let decoded = lightningPayReq.decode(tag[1]);
                satsReceived += decoded.satoshis;
            }
        });
    });

    let satsSent = 0;
    zapsSent.forEach((event) => {
        event.tags.forEach((tag) => {
            if (tag[0] === 'bolt11') {
                let decoded = lightningPayReq.decode(tag[1]);
                satsSent += decoded.satoshis;
            }
        });
    });

    const { events: following, isLoading: followingLoading } = useNostrEvents({
        filter: {
            kinds: [3],
            authors: [pubkey],
            limit: 1,
        },
    });

    // filter for only new followings (latest in a users followers list)
    const filteredFollowers = followers.filter(follower => {
        const lastPTag = follower.tags[follower.tags.length - 1];
        if (lastPTag[0] === "p" && lastPTag[1] === pubkey.toString()) {
            // console.log(follower.tags[follower.tags.length - 1]);
            return true;
        }
    });

    let encoded = nip19.npubEncode(pubkey);
    let parts = encoded.split('npub');
    let npubShortened = 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
    const title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
    const description = userData?.about?.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const nip05 = userData?.nip05
    let profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;
    return (
        <>
            <div className='pt-6 px-6'>
                {/* <ProfileInfoCard pubkey={pubkey.toString()} /> */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        {/* <CardTitle className="text-base font-normal">Profile</CardTitle> */}
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-row items-center space-x-4">
                            <Avatar>
                                <AvatarImage
                                    src={profileImageSrc}
                                    alt="Avatar"
                                    className="rounded-full"
                                />
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{title}</h1>
                                <NIP05 nip05={nip05?.toString() ?? ''} pubkey={pubkey} />

                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className='grid gap-4 grid-cols-2 p-6'>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Followers 🫂</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{followers.length}</div>
                        {/* <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p> */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Following 🫂</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {followingLoading ? "Loading.." : (following.length > 0 ? following[0]?.tags.length : "-")}
                        </div>
                        {/* <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p> */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Zaps received ⚡️</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{zapsReceived.length} zaps</div>
                        <div className="text-xl">{satsReceived} sats</div>
                        {/* <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p> */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Zaps sent ⚡️</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{zapsSent.length} zaps</div>
                        <div className="text-xl">{satsSent} sats</div>
                        {/* <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p> */}
                    </CardContent>
                </Card>
                {/* <RecentFollowerCard followers={filteredFollowers.reverse()} /> */}
                <RecentZapsCard zaps={zapsReceived.reverse() ?? []} />
            </div>
        </>
    );
}

export default ProfileInfoCard;