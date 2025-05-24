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
import { format, isSameDay } from 'date-fns';

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

    const { events, isLoading: isLoading } = useNostrEvents({
        filter: {
            kinds: [7, 9735],
            '#p': [pubkey],
            limit: 50,
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

    // Sort all notifications by date (newest first)
    const sortedEvents = [...events].sort(
        (a, b) => (b.created_at || 0) - (a.created_at || 0)
    );

    // Group notifications by date
    const groupedNotifications = () => {
        const groups: { [key: string]: typeof events } = {};
        
        sortedEvents.forEach(event => {
            const date = new Date(event.created_at * 1000);
            const dateKey = format(date, 'yyyy-MM-dd');
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            
            groups[dateKey].push(event);
        });
        
        return groups;
    };

    // Get formatted date heading based on date
    const getDateHeading = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (isSameDay(date, today)) {
            return "Today";
        } else if (isSameDay(date, yesterday)) {
            return "Yesterday";
        } else {
            return format(date, 'EEEE, MMMM d, yyyy');
        }
    };

    const notificationGroups = groupedNotifications();

    return (
        <>
            <div className='pt-6 px-6'>
                {/* <ProfileInfoCard pubkey={pubkey.toString()} /> */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {events.length > 0 ? (
                            Object.keys(notificationGroups).map(dateKey => (
                                <div key={dateKey} className="mb-6">
                                    <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 mb-2 border-b">
                                        <h3 className="text-sm font-medium text-muted-foreground">
                                            {getDateHeading(dateKey)}
                                        </h3>
                                    </div>
                                    <div className="space-y-1">
                                        {notificationGroups[dateKey].map((notification, index) => (
                                            <Notification key={`${dateKey}-${index}`} event={notification} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">No notifications yet</div>
                        )}
                        {(!events) && (
                            <div className="text-center py-2">
                                <Skeleton className="h-12 w-full mb-2" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default Notifications;