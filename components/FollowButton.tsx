
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useNostr, useNostrEvents } from 'nostr-react';
import { finalizeEvent } from 'nostr-tools';
import { sign } from 'crypto';
import { SignalMedium } from 'lucide-react';

interface FollowButtonProps {
    pubkey: string;
    userPubkey: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ pubkey, userPubkey }) => {
    // const { publish } = useNostr();
    const [isFollowing, setIsFollowing] = useState(false);

    let storedPubkey: string | null = null;
    let storedNsec: string | null = null;
    let isLoggedIn = false;
    if (typeof window !== 'undefined') {
        storedPubkey = window.localStorage.getItem('pubkey');
        storedNsec = window.localStorage.getItem('nsec');
        isLoggedIn = storedPubkey !== null;
    }

    const { events } = useNostrEvents({
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
    if (followingPubkeys.includes(pubkey)) {
      setIsFollowing(true);
    }
  }, [followingPubkeys, pubkey]);

    const handleFollow = async () => {
    //     if (isLoggedIn) {

    //         let eventTemplate = {
    //             kind: 3,
    //             created_at: Math.floor(Date.now() / 1000),
    //             tags: [followingPubkeys],
    //             content: '',
    //         }

    //         console.log(eventTemplate);

    //         if (isFollowing) {
    //             eventTemplate.tags = eventTemplate.tags.filter(tag => tag[1] !== pubkey);
    //         } else {
    //             eventTemplate.tags[0].push(pubkey);
    //         }

    //         console.log(eventTemplate);

    //         let signedEvent = null;
    //         if (storedNsec != null) {
    //             // TODO: Sign Nostr Event with nsec
    //             const nsecArray = storedNsec ? new TextEncoder().encode(storedNsec) : new Uint8Array();
    //             signedEvent = finalizeEvent(eventTemplate, nsecArray);
    //             console.log(signedEvent);
    //         } else if (storedPubkey != null) {
    //             // TODO: Request Extension to sign Nostr Event
    //             console.log('Requesting Extension to sign Nostr Event..');
    //             try {
    //                 signedEvent = await window.nostr.signEvent(eventTemplate);
    //             } catch (error) {
    //                 console.error('Nostr Extension not found or aborted.');
    //             }
    //         }

    //         if (signedEvent !== null) {
    //             console.log(signedEvent);
    //             publish(signedEvent);
    //             setIsFollowing(!isFollowing);
    //         }
    //     }
    };

    return (
        <Button className='w-full' onClick={handleFollow} disabled>
            {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
    );
};

export default FollowButton;