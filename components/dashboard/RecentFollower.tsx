import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useNDK";
import { nip19 } from "nostr-tools";
import Link from "next/link";

export function RecentFollower({ follower }: { follower: any }) {
    const { data: userData } = useProfile(follower.pubkey);

    const encoded = nip19.npubEncode(follower.pubkey);
    const npubShortened = `npub${encoded.split('npub')[1].slice(0, 4)}:${encoded.split('npub')[1].slice(-3)}`;
    const title = userData?.displayName || userData?.name || userData?.nip05 || userData?.npub || npubShortened;
    const profileImageSrc = userData?.image || "https://robohash.org/" + follower.pubkey;
    
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
                    {new Date(follower.created_at * 1000).toLocaleDateString()} {new Date(follower.created_at * 1000).toLocaleTimeString()}
                </p>
            </div>
        </div>
    )
}