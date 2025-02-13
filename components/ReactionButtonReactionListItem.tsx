import Link from "next/link";
import { useProfile } from "@/hooks/useNDK";
import { nip19, type Event as NostrEvent } from "nostr-tools";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function ReactionButtonReactionListItem({ event }: { event: NostrEvent }) {
    const { data: userData } = useProfile(event.pubkey);

    const title = userData?.displayName || userData?.name || userData?.nip05 || 
                 nip19.npubEncode(event.pubkey).slice(0, 8) + ':' + nip19.npubEncode(event.pubkey).slice(-3);
    const hrefProfile = `/profile/${nip19.npubEncode(event.pubkey)}`;
    const profileImageSrc = userData?.image || "https://robohash.org/" + event.pubkey;
    const content = event.content;

    return (
        <Link href={hrefProfile}>
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-1">
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