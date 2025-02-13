import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNostrEvents, useProfile } from '@/hooks/useNDK';
import Notification from './Notification';

interface NotificationsProps {
    pubkey: string;
}

const Notifications: React.FC<NotificationsProps> = ({ pubkey }) => {
    const { data: userData } = useProfile(pubkey);

    // Get zaps
    const { events: zaps } = useNostrEvents({
        filter: {
            kinds: [9735],
            '#p': [pubkey],
            limit: 20,
        },
    });

    // Get reactions
    const { events: reactions } = useNostrEvents({
        filter: {
            kinds: [7],
            '#p': [pubkey],
            limit: 20,
        },
    });

    // Combine and sort notifications
    const allNotifications = [...zaps, ...reactions].sort((a, b) => b.created_at - a.created_at);

    return (
        <>
            <div className='pt-6 px-6'>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-normal">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {allNotifications.map((notification, index) => (
                            <Notification key={index} event={notification.rawEvent()} />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default Notifications;