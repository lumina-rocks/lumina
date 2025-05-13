import Link from "next/link";
import { useNostr, dateToUnix, useNostrEvents, useProfile } from "nostr-react";

import {
    type Event as NostrEvent,
    getEventHash,
    getPublicKey,
    finalizeEvent,
    nip19,
} from "nostr-tools";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useProfileValue } from "@nostr-dev-kit/ndk-hooks";

export default function ZapButtonListItem({ event }: { event: NostrEvent }) {

    let pubkey = event.pubkey;
    
    // Try to extract pubkey from description tag if available
    const descriptionTag = event.tags.find(tag => tag[0] === 'description');
    if (descriptionTag && descriptionTag[1]) {
        try {
            const descriptionEvent = JSON.parse(descriptionTag[1]);
            if (descriptionEvent.pubkey) {
                pubkey = descriptionEvent.pubkey;
            }
        } catch (e) {
            console.error('Failed to parse description tag:', e);
        }
    }
    
    // Fallback to 'p' tag if description doesn't have a pubkey
    if (pubkey === event.pubkey) {
        for(let i = 0; i < event.tags.length; i++) {
            if(event.tags[i][0] === 'P' || event.tags[i][0] === 'p') {
                pubkey = event.tags[i][1];
                break;
            }
        }
    }

    const userData = useProfileValue(pubkey);

    const title = userData?.username || userData?.display_name || userData?.name || nip19.npubEncode(pubkey).slice(0, 8) + ':' + nip19.npubEncode(pubkey).slice(-3);;
    const createdAt = new Date(event.created_at * 1000);
    const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;
    let sats = 0;
    var lightningPayReq = require('bolt11');
    event.tags.forEach((tag) => {
        if (tag[0] === 'bolt11') {
            try {
                let decoded = lightningPayReq.decode(tag[1]);
                // console.log(decoded.satoshis);
                sats =  decoded.satoshis;
            } catch (e) {
                console.error("Error decoding bolt11 tag:", e);
                return null;
            }
        }
    });

    return (
        <Link href={hrefProfile}>
            <div key={event.id} className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-1">
                    {/* <img src={profileImageSrc} className="w-8 h-8 rounded-full" /> */}
                    <Avatar>
                        <AvatarImage src={profileImageSrc} alt={String(title)} />
                    </Avatar>
                    <span>{title}</span>
                    <span className="pl-2">{sats} sats ⚡️</span>
                </div>
            </div>
        </Link>
    );
}