import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useNDK";
import { nip19 } from "nostr-tools";
import Link from "next/link";

export function RecentZap({ zap }: { zap: any }) {
    let zapperPubkey = zap.pubkey;
    for(let tag of zap.tags) {
        if(tag[0] === 'P') {
            zapperPubkey = tag[1];
        }
    }

    const { data: userData } = useProfile(zapperPubkey);

    const encoded = nip19.npubEncode(zapperPubkey);
    const npubShortened = `npub${encoded.split('npub')[1].slice(0, 4)}:${encoded.split('npub')[1].slice(-3)}`;
    const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || npubShortened;
    const profileImageSrc = userData?.image || "https://robohash.org/" + zapperPubkey;
    
    let sats = 0;
    for(let tag of zap.tags) {
        if(tag[0] === 'bolt11') {
            const lightningPayReq = require('bolt11');
            const decoded = lightningPayReq.decode(tag[1]);
            sats = decoded.satoshis;
            break;
        }
    }

    return (
        <div className="flex items-center" key={zap.id}>
            <Link href={`/profile/${encoded}`}>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={profileImageSrc} alt="Avatar" />
                    <AvatarFallback>n/a</AvatarFallback>
                </Avatar>
            </Link>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{title}</p>
                <p className="text-sm text-muted-foreground">
                    {new Date(zap.created_at * 1000).toLocaleDateString()} {new Date(zap.created_at * 1000).toLocaleTimeString()}
                </p>
                <p className="text-sm text-muted-foreground">{sats} sats</p>
            </div>
        </div>
    )
}