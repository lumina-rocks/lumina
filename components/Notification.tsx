import React from 'react';
import { useNostrEvents, useProfile } from "nostr-react";
import {
    NostrEvent,
    Event,
    nip19,
} from "nostr-tools";
import { Avatar, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { format } from 'date-fns';

interface NotificationProps {
    event: NostrEvent;
}

const Notification: React.FC<NotificationProps> = ({ event }) => {
    let sender = event.pubkey;
    let sats = 0;
    let reactedToId = '';

    const { data: userData, isLoading: userDataLoading } = useProfile({
        pubkey: sender,
    });

    if (!event) {
        return null;
    }

    if (event.kind === 9735) {
        for (let tag of event.tags) {
            if (tag[0] === 'P') {
                sender = tag[1];
            }
            if (tag[0] === 'bolt11') {
                let bolt11decoded = require('light-bolt11-decoder').decode(tag[1]);
                for (let field of bolt11decoded.sections) {
                    if (field.name === 'amount') {
                        sats = field.value / 1000;
                    }
                }
            }
        }
    }

    if (event.kind === 7) {
        for (let tag of event.tags) {
            if (tag[0] === 'e') {
                reactedToId = tag[1];
            }
        }
    }

    let name = userData?.name ?? nip19.npubEncode(event.pubkey).slice(0, 8) + ':' + nip19.npubEncode(event.pubkey).slice(-3);
    let createdAt = new Date(event.created_at * 1000);
    
    const formatTime = (date: Date) => {
        return format(date, 'h:mm a');
    };

    const getNotificationContent = () => {
        switch (event.kind) {
            case 9735: // ZAP
                return (
                    <div className='flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-md transition-colors'>
                        <div className='flex-shrink-0 w-10 text-center font-medium text-amber-500'>
                            {sats} ⚡️
                        </div>
                        <Avatar className='flex-shrink-0'>
                            <AvatarImage src={userData?.picture} alt={name} />
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium'>{name} <span className='text-muted-foreground font-normal'>zapped you</span></p>
                            <p className='text-xs text-muted-foreground'>{formatTime(createdAt)}</p>
                        </div>
                    </div>
                );
            case 3: // FOLLOW
                return (
                    <div className='flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-md transition-colors'>
                        <div className='flex-shrink-0 w-10 text-center font-medium text-blue-500'>
                            👋
                        </div>
                        <Avatar className='flex-shrink-0'>
                            <AvatarImage src={userData?.picture} alt={name} />
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium'>{name} <span className='text-muted-foreground font-normal'>started following you</span></p>
                            <p className='text-xs text-muted-foreground'>{formatTime(createdAt)}</p>
                        </div>
                    </div>
                );
            case 7: // REACTION
                return (
                    <Link href={"/note/" + reactedToId} className='block'>
                        <div className='flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-md transition-colors'>
                            <div className='flex-shrink-0 w-10 text-center text-lg'>
                                {event.content}
                            </div>
                            <Avatar className='flex-shrink-0'>
                                <AvatarImage src={userData?.picture} alt={name} />
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium'>{name} <span className='text-muted-foreground font-normal'>reacted to your post</span></p>
                                <p className='text-xs text-muted-foreground'>{formatTime(createdAt)}</p>
                            </div>
                        </div>
                    </Link>
                );
            default:
                return null;
        }
    };

    return (
        <div className='notification-item'>
            {getNotificationContent()}
        </div>
    );
}

export default Notification;