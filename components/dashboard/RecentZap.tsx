import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useProfile } from "nostr-react";
import {
    nip19,
} from "nostr-tools";
import Link from "next/link";

export function RecentZap({ zap }: { zap: any }) {

    let zapperPubkey = zap.pubkey;
    for(let tag of zap.tags){
        if(tag[0] === 'P') {
            zapperPubkey = tag[1];
        }
    }

    const { data: userData, isLoading: userDataLoading } = useProfile({
        pubkey: zapperPubkey,
    });

    console.log('zap', zap)

    let encoded = nip19.npubEncode(zapperPubkey);
    let parts = encoded.split('npub');
    let npubShortened = 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
    let title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + zap.pubkey;
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
                    {new Date(zap.created_at * 1000).toLocaleDateString()} {new Date(zap.created_at * 1000).toLocaleTimeString()}                                    </p>
            </div>
            {/* <div className="ml-auto font-medium">{zap.amount}</div> */}
        </div>
    )
}