'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { nip19 } from "nostr-tools"
import { Label } from "./ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProfile, useNDK } from '@/hooks/useNDK';

export function UpdateProfileForm() {
    const ndk = useNDK();

    let npub = '';
    let pubkey = '';

    if (typeof window !== 'undefined') {
        pubkey = window.localStorage.getItem("pubkey") ?? '';
        if (pubkey && pubkey.length > 0) {
            npub = nip19.npubEncode(pubkey);
        }
    }

    const { data: userData } = useProfile(pubkey);

    const [username, setUsername] = useState(userData?.name);
    const [displayName, setDisplayName] = useState(userData?.displayName);
    const [bio, setBio] = useState(userData?.about);

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };
    const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(event.target.value);
    };
    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBio(event.target.value);
    };

    async function handleProfileUpdate() {
        const ndkEvent = ndk.getEvent();
        ndkEvent.kind = 0;
        ndkEvent.created_at = Math.floor(Date.now() / 1000);
        ndkEvent.content = JSON.stringify({
            name: username,
            displayName: displayName,
            about: bio
        });

        try {
            const loginType = window.localStorage.getItem("loginType");
            if (loginType === "extension") {
                const signedEvent = await window.nostr.signEvent(ndkEvent.rawEvent());
                Object.assign(ndkEvent, signedEvent);
            } else if (loginType === "raw_nsec") {
                const nsecStr = window.localStorage.getItem("nsec");
                if (!nsecStr) throw new Error("No nsec found");
                await ndkEvent.sign();
            }

            await ndkEvent.publish();
            window.location.href = `/profile/${npub}`;
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    }

    return (
        <div className="w-full max-w-full">
            <div className="py-4">
                <div>
                    <Label>Your npub (Public Key):</Label>
                    <Input type="text" placeholder="npub1.." value={npub} readOnly />
                </div>
                <div className='py-4'>
                    <Label>Your Username</Label>
                    <Input type="text" id="username" placeholder="Satoshi" value={username} onChange={handleUsernameChange} />
                </div>
                <div className='py-4'>
                    <Label>Your Displayed Name</Label>
                    <Input type="text" id="displayname" placeholder="Satoshi" value={displayName} onChange={handleDisplayNameChange} />
                </div>
                <div className='py-4'>
                    <Label>Your Bio</Label>
                    <Textarea id="bio" placeholder="Type something about you.." rows={10} value={bio} onChange={handleBioChange} />
                </div>
                <Button variant={'default'} type="submit" className='w-full' onClick={handleProfileUpdate}>Submit</Button>
            </div>
        </div>
    )
}