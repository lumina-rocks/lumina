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

export default function ReactionButtonReactionListItem({ event }: { event: NostrEvent }) {

    let pubkey = event.pubkey;

    const { data: userData } = useProfile({
        pubkey,
    });

    const title = userData?.username || userData?.display_name || userData?.name || nip19.npubEncode(pubkey).slice(0, 8) + ':' + nip19.npubEncode(pubkey).slice(-3);;
    const createdAt = new Date(event.created_at * 1000);
    const hrefProfile = `/profile/${nip19.npubEncode(pubkey)}`;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + pubkey;
    const content = event.content;

    console.log("event", event.content);

    return (
        <Link href={hrefProfile}>
            <div key={event.id} className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-1">
                    {/* <img src={profileImageSrc} className="w-8 h-8 rounded-full" /> */}
                    <Avatar>
                        <AvatarImage src={profileImageSrc} alt={title} />
                    </Avatar>
                    <span>{title}</span>
                    <span className="pl-2">{content}</span>
                </div>
            </div>
        </Link>
    );
}