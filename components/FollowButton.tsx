import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useNostr, useNostrEvents } from 'nostr-react';
import { finalizeEvent, NostrEvent } from 'nostr-tools';
import { sign } from 'crypto';
import { SignalMedium } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { signEvent } from '@/utils/utils';

interface FollowButtonProps {
    pubkey: string;
    userPubkey: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ pubkey, userPubkey }) => {
    const { publish } = useNostr()

    const [isFollowing, setIsFollowing] = useState(false);
    const loginType = typeof window !== "undefined" ? window.localStorage.getItem("loginType") : null

    const { events, isLoading } = useNostrEvents({
        filter: {
            kinds: [3],
            authors: [userPubkey],
            limit: 1,
        },
    });

    let followingPubkeys = events.flatMap((event) => event.tags.map(tag => tag[1]));
    // filter out all null or undefined
    followingPubkeys = followingPubkeys.filter((tag) => tag);


    useEffect(() => {
        // Reset the following state when receiving new data
        setIsFollowing(followingPubkeys.includes(pubkey));
    }, [followingPubkeys, pubkey]);

    const handleFollow = async () => {
            if (userPubkey) {
                // Get a unique set of pubkeys to follow
                let uniqueFollows = new Set(followingPubkeys);
                
                // Add or remove the target pubkey
                if (isFollowing) {
                    uniqueFollows.delete(pubkey);
                } else {
                    uniqueFollows.add(pubkey);
                }
                
                // Convert to array and create properly formatted p tags
                const formattedTags = Array.from(uniqueFollows).map(pk => ["p", pk]);

                let eventTemplate = {
                    kind: 3,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: formattedTags,
                    content: '',
                    pubkey: '', // Placeholder
                    id: '', // Placeholder
                    sig: '', // Placeholder
                }

                console.log('Sending event template:', eventTemplate);

                let signedEvent = null;
                signedEvent = await signEvent(loginType, eventTemplate) as NostrEvent;

                if (signedEvent !== null) {
                    console.log('Publishing signed event:', signedEvent);
                    publish(signedEvent);
                    
                    // Update UI state immediately
                    setIsFollowing(!isFollowing);
                    
                    // Optionally, store this change in a local state if needed
                    // This could help with rapid UI interactions before the relay responds
                }
            }
    };

    return (
        <Button className='w-full' onClick={handleFollow} disabled={isLoading || !userPubkey}>
            {isLoading ? (
                <ReloadIcon className='animate-spin' />
            ) : (
                isFollowing ? 'Unfollow' : 'Follow'
            )}
        </Button>
    );
};

export default FollowButton;