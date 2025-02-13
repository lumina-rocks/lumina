import Link from "next/link";
import { useProfile } from "@/hooks/useNDK";
import { nip19, type Event as NostrEvent } from "nostr-tools";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function ZapButtonListItem({ event }: { event: NostrEvent }) {
    // Find the actual zapper's pubkey from the P tag
    let pubkey = event.pubkey;
    for(let tag of event.tags) {
        if(tag[0] === 'P') {
            pubkey = tag[1];
            break;
        }
    }

    const { data: userData } = useProfile(pubkey);

    const title = userData?.displayName || userData?.name || userData?.nip05 || 
                 nip19.npubEncode(pubkey).slice(0, 8) + ':' + nip19.npubEncode(pubkey).slice(-3);
    const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
    const profileImageSrc = userData?.image || "https://robohash.org/" + pubkey;

    // Calculate zap amount
    let sats = 0;
    const lightningPayReq = require('bolt11');
    event.tags.forEach((tag) => {
        if (tag[0] === 'bolt11') {
            const decoded = lightningPayReq.decode(tag[1]);
            sats = decoded.satoshis;
        }
    });

    return (
        <Link href={hrefProfile}>
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-1">
                    <Avatar>
                        <AvatarImage src={profileImageSrc} alt={title} />
                    </Avatar>
                    <span>{title}</span>
                    <span className="pl-2">{sats} sats ⚡️</span>
                </div>
            </div>
        </Link>
    );
}