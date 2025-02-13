import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useNDK, useNostrEvents } from '@/hooks/useNDK';

interface FollowButtonProps {
    pubkey: string;
    userPubkey: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ pubkey, userPubkey }) => {
    const ndk = useNDK();
    const [isFollowing, setIsFollowing] = useState(false);

    const { events } = useNostrEvents({
        filter: {
            kinds: [3],
            authors: [userPubkey],
            limit: 1,
        },
    });

    let followingPubkeys = events.flatMap((event) => event.tags.map(tag => tag[1]));
    followingPubkeys = followingPubkeys.filter((tag) => tag);

    useEffect(() => {
        if (followingPubkeys.includes(pubkey)) {
            setIsFollowing(true);
        }
    }, [followingPubkeys, isFollowing, pubkey]);

    const handleFollow = async () => {
        const ndkEvent = ndk.getEvent();
        ndkEvent.kind = 3;
        ndkEvent.created_at = Math.floor(Date.now() / 1000);
        ndkEvent.content = '';

        // Get current following list and update it
        const currentList = [...followingPubkeys];
        if (isFollowing) {
            ndkEvent.tags = currentList.filter(p => p !== pubkey).map(p => ['p', p]);
        } else {
            currentList.push(pubkey);
            ndkEvent.tags = currentList.map(p => ['p', p]);
        }

        try {
            const loginType = window.localStorage.getItem("loginType");
            if (loginType === "extension") {
                const signedEvent = await window.nostr.signEvent(ndkEvent.rawEvent());
                Object.assign(ndkEvent, signedEvent);
            } else if (loginType === "amber") {
                alert("Signing with Amber is not implemented yet, sorry!");
                return;
            } else if (loginType === "raw_nsec") {
                const nsecStr = window.localStorage.getItem("nsec");
                if (!nsecStr) throw new Error("No nsec found");
                await ndkEvent.sign();
            }

            await ndkEvent.publish();
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Failed to follow/unfollow:", error);
        }
    };

    return (
        <Button
            variant={isFollowing ? "default" : "outline"}
            className="w-full"
            onClick={handleFollow}
        >
            {isFollowing ? "Following" : "Follow"}
        </Button>
    );
}

export default FollowButton;