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

export default function ZapButtonListItem({ event }: { event: NostrEvent }) {

    let pubkey = event.pubkey;
    for(let i = 0; i < event.tags.length; i++) {
        if(event.tags[i][0] === 'P') {
            pubkey = event.tags[i][1];
            break;
        }
    }

    const { data: userData } = useProfile({
        pubkey,
    });

    const title = userData?.username || userData?.display_name || userData?.name || nip19.npubEncode(pubkey).slice(0, 8) + ':' + nip19.npubEncode(pubkey).slice(-3);;
    const createdAt = new Date(event.created_at * 1000);
    const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;
    let sats = 0;
    var lightningPayReq = require('bolt11');
    event.tags.forEach((tag) => {
        if (tag[0] === 'bolt11') {
            let decoded = lightningPayReq.decode(tag[1]);
            // console.log(decoded.satoshis);
            sats =  decoded.satoshis;
        }
    });

    // Calculate lnurl pay request URL from the zap tag
    let lnurlPayRequestUrl = "";
    for (let tag of event.tags) {
        if (tag[0] === 'zap') {
            lnurlPayRequestUrl = tag[1];
            break;
        }
    }

    // Validate the nostr query parameter
    let nostrQueryParamValid = false;
    for (let tag of event.tags) {
        if (tag[0] === 'nostr') {
            nostrQueryParamValid = true;
            break;
        }
    }

    return (
        <Link href={hrefProfile}>
            <div key={event.id} className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-1">
                    {/* <img src={profileImageSrc} className="w-8 h-8 rounded-full" /> */}
                    <Avatar>
                        <AvatarImage src={profileImageSrc} alt={title} />
                    </Avatar>
                    <span>{title}</span>
                    <span className="pl-2">{sats} sats ⚡️</span>
                    <span className="pl-2">lnurl Pay Request URL: {lnurlPayRequestUrl}</span>
                    <span className="pl-2">Nostr Query Parameter Valid: {nostrQueryParamValid ? "Yes" : "No"}</span>
                </div>
            </div>
        </Link>
    );
}
