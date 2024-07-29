import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { nip19 } from "nostr-tools"
import { Label } from "../ui/label"
import { bytesToHex, hexToBytes } from '@noble/hashes/utils' 

export function CreateSecretKeyForm() {
    const [nsec, setNsec] = useState('');
    const [npub, setNpub] = useState('');

    const regenerateKey = () => {
        let sk = generateSecretKey(); // `sk` is a Uint8Array
        let pk = getPublicKey(sk); // `pk` is a hex string
        let newNpub = nip19.npubEncode(pk); // `npub` is a string
        let newNsec = nip19.nsecEncode(sk); // `nsec` is a string

        setNsec(newNsec);
        setNpub(newNpub);
    }

    // Schlüssel generieren, wenn die Komponente zum ersten Mal gerendert wird
    useEffect(() => {
        if(localStorage.getItem("nsec")) {
            const nsecString = localStorage.getItem('nsec') || '';
            const nsecBytes = hexToBytes(nsecString);
            setNsec(nip19.nsecEncode(nsecBytes));
            setNpub(nip19.npubEncode(getPublicKey(nsecBytes)));
        } else {
            regenerateKey();
        }
    }, []);

    return (
        <div className="w-full max-w-full">
            <div className="py-4">
                <div className='py-4'>
                    <Label>Your nsec (Secret Key)</Label>
                    <Input type="text" placeholder="nsec1.." value={nsec} readOnly />
                </div>
                <Button variant={'secondary'} type="submit" className='w-full' onClick={regenerateKey}>Regenerate</Button>
            </div>
            <div>
                <Label>Your npub (Public Key):</Label>
                <Input type="text" placeholder="npub1.." value={npub} readOnly/>
                <Button className="w-full mt-4" onClick={() => {
                    localStorage.setItem('nsec', bytesToHex(nip19.decode(nsec).data as Uint8Array));
                    localStorage.setItem("loginType", "raw_nsec");
                    localStorage.setItem("pubkey", nip19.decode(npub).data.toString());
                    window.location.href = '/onboarding/createProfile';
                }}>Next</Button>
            </div>
        </div>
    )
}