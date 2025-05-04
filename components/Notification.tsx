import React from 'react';
import { useNostrEvents, useProfile } from "nostr-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import {
    NostrEvent,
    Event,
    nip19,
} from "nostr-tools";
import { Avatar, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { useProfileValue } from '@nostr-dev-kit/ndk-hooks';

interface NotificationProps {
    event: NostrEvent;
}

const Notification: React.FC<NotificationProps> = ({ event }) => {
    let sender = event.pubkey;
    let sats = 0;
    let reactedToId = '';

    const userData = useProfileValue(sender);

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

    return (
        <>
            <div className='pt-6 px-6'>
                {/* ZAP */}
                {event.kind === 9735 && (
                    <div className='grid grid-cols-6 justify-center items-center'>
                        <p className='col-span-1'>{sats} sats ⚡️</p>
                        <div className='col-span-1'>
                            <Avatar>
                                <AvatarImage src={userData?.picture} alt={name} />
                            </Avatar>
                        </div>
                        <div className='col-span-4'>
                            <p>{name} zapped you</p>
                            <p>{createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString()}</p>
                        </div>
                    </div>
                )}
                {/* FOLLOW */}
                {event.kind === 3 && (
                    <div className='grid grid-cols-6 justify-center items-center'>
                        <p className='col-span-1'>{event.content}</p>
                        <div className='col-span-1'>
                            <Avatar>
                                <AvatarImage src={userData?.picture} alt={name} />
                            </Avatar>
                        </div>
                        <div className='col-span-4'>
                            <p>{name} started following you</p>
                            <p>{createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString()}</p>
                        </div>
                    </div>
                )}
                {/* REACTION */}
                {event.kind === 7 && (
                    <Link href={"/note/" + reactedToId}>
                        <div className='grid grid-cols-6 justify-center items-center'>
                            <p className='col-span-1'>{event.content}</p>
                            <div className='col-span-1'>
                                <Avatar>
                                    <AvatarImage src={userData?.picture} alt={name} />
                                </Avatar>
                            </div>
                            <div className='col-span-4'>
                                <p>{name} reacted to you</p>
                                <p>{createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
            <hr className='mt-6' />
        </>
    );
}

export default Notification;