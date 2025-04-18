'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { nip19 } from "nostr-tools"
import { Label } from "./ui/label"
import { Textarea } from "@/components/ui/textarea"
import { verifyEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils'
import { useNostr, useProfile } from 'nostr-react';
import { signEvent } from '@/utils/utils';

export function UpdateProfileForm() {

    const { publish } = useNostr();

    let npub = '';
    let pubkey = '';
    let loginType = '';
    let nsec: Uint8Array;

    if (typeof window !== 'undefined') {
        pubkey = window.localStorage.getItem("pubkey") ?? '';
        const nsecHex = window.localStorage.getItem("nsec");
        loginType = window.localStorage.getItem("loginType") ?? '';

        if (pubkey && pubkey.length > 0) {
            npub = nip19.npubEncode(pubkey);
        }

        if (nsecHex && nsecHex.length > 0) {
            nsec = hexToBytes(nsecHex);
        }
    }

    let { data: userData } = useProfile({
        pubkey,
    });

    const [username, setUsername] = useState(userData?.name);
    const [displayName, setDisplayName] = useState(userData?.display_name);
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
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const bio = (document.getElementById('bio') as HTMLInputElement).value;
        const displayname = (document.getElementById('displayname') as HTMLInputElement).value;

        if (loginType) {
            let event = {
                kind: 0,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: `{"name": "${username}", "about": "${bio}"}`,
                pubkey: pubkey,
                id: "",
                sig: "",
            };

            let signedEvent = await signEvent(loginType, event);

            if (signedEvent === null) {
                alert('Failed to sign the event. Please check your connection and try again.');
                return;
            }

            let isGood = verifyEvent(signedEvent);

            if (isGood) {
                publish(signedEvent);
                window.location.href = `/profile/${npub}`;
            }
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
                    {/* <Input type="text" id="bio" placeholder="Type something about you.." /> */}
                    <Textarea id="bio" placeholder="Type something about you.." rows={10} value={bio} onChange={handleBioChange} />
                </div>
                <Button variant={'default'} type="submit" className='w-full' onClick={handleProfileUpdate}>Submit</Button>
            </div>
        </div>
    )
}