'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generatePrivateKey, getPublicKey } from 'nostr-tools/pure'
import { nip19 } from "nostr-tools"
import { Label } from "./ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { useNDK } from '@/hooks/useNDK';

declare global {
    interface Window {
        nostr: any;
    }
}

export function LoginForm() {
    const ndk = useNDK();
    let publicKey = useRef(null);
    let nsecInput = useRef<HTMLInputElement>(null);
    let npubInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // handle Amber Login Response
        const urlParams = new URLSearchParams(window.location.search);
        const amberResponse = urlParams.get('amberResponse');
        if (amberResponse !== null) {
            localStorage.setItem("pubkey", amberResponse);
            localStorage.setItem("loginType", "amber");
            window.location.href = `/profile/${amberResponse}`;
        }
    }, []);

    const handleAmber = async () => {
        const hostname = window.location.host;
        if (!hostname) {
            throw new Error("Hostname is null or undefined");
        }
        const intent = `intent:#Intent;scheme=nostrsigner;S.compressionType=none;S.returnType=signature;S.type=get_public_key;S.callbackUrl=http://${hostname}/login?amberResponse=;end`;
        window.location.href = intent;
    };

    const handleExtension = async () => {
        if (typeof window !== 'undefined') {
            try {
                const pubkey = await window.nostr.getPublicKey();
                localStorage.setItem("pubkey", pubkey);
                localStorage.setItem("loginType", "extension");
                window.location.href = `/profile/${nip19.npubEncode(pubkey)}`;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleNsecLogin = async () => {
        if (nsecInput.current !== null) {
            try {
                let input = nsecInput.current.value;
                let nsec = null;
                let pubkey = null;

                if (input.startsWith("nsec1")) {
                    nsec = nip19.decode(input).data.toString();
                    pubkey = getPublicKey(hexToBytes(nsec));
                } else {
                    nsec = input;
                    pubkey = getPublicKey(hexToBytes(input));
                }

                localStorage.setItem("nsec", nsec);
                localStorage.setItem("pubkey", pubkey);
                localStorage.setItem("loginType", "raw_nsec");

                window.location.href = `/profile/${nip19.npubEncode(pubkey)}`;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleNpubLogin = async () => {
        if (npubInput.current !== null) {
            try {
                let input = npubInput.current.value;
                let pubkey = null;

                if (input.startsWith("npub1")) {
                    pubkey = nip19.decode(input).data.toString();
                } else {
                    pubkey = input;
                }

                // Verify the pubkey exists by trying to fetch their profile
                const user = ndk.getUser({ pubkey });
                const profile = await user.fetchProfile();
                
                if (profile || confirm("No profile found for this key. Continue anyway?")) {
                    localStorage.setItem("pubkey", pubkey);
                    localStorage.setItem("loginType", "readOnly_npub");
                    window.location.href = `/profile/${nip19.npubEncode(pubkey)}`;
                }
            } catch (e) {
                console.error(e);
                alert("Invalid public key");
            }
        }
    };

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Login with your preferred method.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='grid gap-4'>
                    <div>
                        <Button className='w-full' onClick={handleExtension}></Button>
                            Login with Extension
                        </Button>
                    </div>
                    <div>
                        <Button className='w-full' onClick={handleAmber}>
                            Login with Amber
                        </Button>
                    </div>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className='flex flex-row items-center'>
                                    Login with Private Key (nsec)
                                    <InfoIcon className='ml-2 h-4 w-4' />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className='py-4'>
                                    <p className="text-sm text-muted-foreground">Warning: This is not recommended for security reasons.</p>
                                    <div className='flex flex-row space-x-2 py-4'>
                                        <Input type="text" placeholder="Enter nsec.." ref={nsecInput} />
                                        <Button onClick={handleNsecLogin}>Login</Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className='flex flex-row items-center'>
                                    Login with Public Key (npub)
                                    <InfoIcon className='ml-2 h-4 w-4' />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className='py-4'>
                                    <p className="text-sm text-muted-foreground">Read-only mode - you won&apos;t be able to post.</p>
                                    <div className='flex flex-row space-x-2 py-4'>
                                        <Input type="text" placeholder="Enter npub.." ref={npubInput} />
                                        <Button onClick={handleNpubLogin}>Login</Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </CardContent>
            <CardFooter>
                <div className='w-full text-center'>
                    <p className="text-sm text-muted-foreground">Don&apos;t have an Account? <Link href="/onboarding">Create Account</Link></p>
                </div>
            </CardFooter>
        </Card>
    )
}