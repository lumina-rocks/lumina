import React from 'react';
import { useProfile } from "@/hooks/useNDK";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { nip19 } from "nostr-tools";

interface NotificationProps {
    event: any;
}

const Notification: React.FC<NotificationProps> = ({ event }) => {
    let sender = event.pubkey;
    let sats = 0;
    let reactedToId = '';

    const { data: userData } = useProfile(sender);

    if (!event) {
        return null;
    }

    if (event.kind === 9735) {
        for (let tag of event.tags) {
            if (tag[0] === 'P') {
                sender = tag[1];
            }
            if (tag[0] === 'bolt11') {
                const lightningPayReq = require('bolt11');
                const decoded = lightningPayReq.decode(tag[1]);
                sats = decoded.satoshis;
            }
        }
    }

    const name = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || nip19.npubEncode(sender).slice(0, 8) + ':' + nip19.npubEncode(sender).slice(-3);
    const profileImageSrc = userData?.image || "https://robohash.org/" + sender;
    const createdAt = new Date(event.created_at * 1000);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Link href={`/profile/${nip19.npubEncode(sender)}`} style={{ textDecoration: 'none' }}></Link>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar>
                                <AvatarImage src={profileImageSrc} />
                            </Avatar>
                            <span className='break-all' style={{ marginLeft: '10px' }}>{name}</span>
                        </div>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {event.kind === 9735 && (
                    <div>
                        <p>{name} zapped you with {sats} sats</p>
                        <p>{createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}</p>
                    </div>
                )}
                {event.kind === 3 && (
                    <div>
                        <p>{name} started following you</p>
                        <p>{createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}</p>
                    </div>
                )}
                {event.kind === 7 && (
                    <Link href={`/note/${reactedToId}`} style={{ textDecoration: 'none' }}>
                        <p>{name} reacted to your note</p>
                        <p>{createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}</p>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export default Notification;