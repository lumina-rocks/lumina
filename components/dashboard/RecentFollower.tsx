import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useProfile } from "nostr-react";
import {
    nip19,
} from "nostr-tools";
import Link from "next/link";

export function RecentFollower({ follower }: { follower: any }) {

    const { data: userData, isLoading: userDataLoading } = useProfile({
        pubkey: follower.pubkey,
    });

    let encoded = nip19.npubEncode(follower.pubkey);
    let parts = encoded.split('npub');
    let npubShortened = 'npub' + parts[1].slice(0, 4) + ':' + parts[1].slice(-3);
    let title = userData?.username || userData?.display_name || userData?.name || userData?.npub || npubShortened;
    const profileImageSrc = userData?.picture || "https://robohash.org/" + follower.pubkey;
    return (
        <div className="flex items-center" key={follower.id}>
            <Link href={`/profile/${encoded}`}>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={profileImageSrc} alt="Avatar" />
                    <AvatarFallback>n/a</AvatarFallback>
                </Avatar>
            </Link>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{title}</p>
                <p className="text-sm text-muted-foreground">
                    {new Date(follower.created_at * 1000).toLocaleDateString()} {new Date(follower.created_at * 1000).toLocaleTimeString()}                                    </p>
            </div>
            {/* <div className="ml-auto font-medium">{follower.amount}</div> */}
        </div>
    )
}