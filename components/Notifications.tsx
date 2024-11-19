import React from 'react';
import { useNostrEvents, useProfile } from "nostr-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '@/components/ui/avatar';
import NIP05 from '@/components/nip05';
import {
    nip19,
} from "nostr-tools";
import Notification from './Notification';

interface NotificationsProps {
    pubkey: string;
}

const Notifications: React.FC<NotificationsProps> = ({ pubkey }) => {
    const { data: userData, isLoading: userDataLoading } = useProfile({
        pubkey,
    });


    // const { events: followers, isLoading: followersLoading } = useNostrEvents({
    //     filter: {
    //         kinds: [3],
    //         '#p': [pubkey],
    //         limit: 50,
    //     },
    // });

    const { events: zaps, isLoading: zapsLoading } = useNostrEvents({
        filter: {
            kinds: [9735],
            '#p': [pubkey],
            limit: 20,
        },
    });

    const { events: reactions, isLoading: reactionsLoading } = useNostrEvents({
        filter: {
            kinds: [7],
            '#p': [pubkey],
            limit: 20,
        },
    });

    // const { events: following, isLoading: followingLoading } = useNostrEvents({
    //     filter: {
    //         kinds: [3],
    //         authors: [pubkey],
    //         limit: 1,
    //     },
    // });

    // filter for only new followings (latest in a users followers list)
    // const filteredFollowers = followers.filter(follower => {
    //     const lastPTag = follower.tags[follower.tags.length - 1];
    //     if (lastPTag[0] === "p" && lastPTag[1] === pubkey.toString()) {
    //         // console.log(follower.tags[follower.tags.length - 1]);
    //         return true;
    //     }
    // });

    // let allNotifications = [...filteredFollowers, ...zaps].sort((a, b) => b.created_at - a.created_at);
    let allNotifications =  [...zaps, ...reactions].sort((a, b) => b.created_at - a.created_at);

    return (
        <>
            <div className='pt-6 px-6'>
                {/* <ProfileInfoCard pubkey={pubkey.toString()} /> */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {allNotifications.map((notification, index) => (
                            <Notification key={index} event={notification} />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default Notifications;