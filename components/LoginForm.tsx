declare global {
    interface Window {
        nostr: any;
    }
}

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useEffect, useRef } from "react"
import { getPublicKey, generateSecretKey, nip19 } from 'nostr-tools'
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

export function LoginForm() {

    let publicKey = useRef(null);
    let nsecInput = useRef<HTMLInputElement>(null);
    let npubInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // handle Amber Login Response
        const urlParams = new URLSearchParams(window.location.search);
        const amberResponse = urlParams.get('amberResponse');
        if (amberResponse !== null) {
            localStorage.setItem("pubkey", nip19.decode(amberResponse).data.toString());
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
    }

    const handleExtensionLogin = async () => {
        // eslint-disable-next-line
        if (window.nostr !== undefined) {
            publicKey.current = await window.nostr.getPublicKey()
            console.log("Logged in with pubkey: ", publicKey.current);
            if (publicKey.current !== null) {
                localStorage.setItem("pubkey", publicKey.current);
                localStorage.setItem("loginType", "extension");
                // window.location.reload();
                window.location.href = `/profile/${nip19.npubEncode(publicKey.current)}`;
            }
        }
    };

    // const handleNsecSignUp = async () => {
    //     let nsec = generateSecretKey();
    //     console.log('nsec: ' + nsec);

    //     let nsecHex = bytesToHex(nsec);
    //     console.log('bytesToHex nsec: ' + nsecHex);

    //     let pubkey = getPublicKey(nsec);
    //     console.log('pubkey: ' + pubkey);

    //     localStorage.setItem("nsec", nsecHex);
    //     localStorage.setItem("pubkey", pubkey);
    //     localStorage.setItem("loginType", "raw_nsec")
    //     window.location.href = `/profile/${nip19.npubEncode(pubkey)}`;
    // };

    const handleNsecLogin = async () => {
        if (nsecInput.current !== null) {
            try {
                let input = nsecInput.current.value;
                if (input.includes("nsec")) {
                    input = bytesToHex(nip19.decode(input).data as Uint8Array);
                    console.log('decoded nsec: ' + input);
                }
                let nsecBytes = hexToBytes(input);
                let nsecHex = bytesToHex(nsecBytes);
                let pubkey = getPublicKey(nsecBytes);

                localStorage.setItem("nsec", nsecHex);
                localStorage.setItem("pubkey", pubkey);
                localStorage.setItem("loginType", "raw_nsec")

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
                let npub = null;
                let pubkey = null;
                if (input.startsWith("npub1")) {
                    npub = input;
                    pubkey = nip19.decode(input).data.toString();
                } else {
                    pubkey = input;
                    npub = nip19.npubEncode(input);
                }

                localStorage.setItem("pubkey", pubkey);
                localStorage.setItem("loginType", "readOnly_npub")

                window.location.href = `/profile/${npub}`;
            } catch (e) {
                console.error(e);
            }
        }
    };


    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle className="text-2xl">Login to Lumina</CardTitle>
                <CardDescription>
                    Login to your account either with a nostr extension or with your nsec.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-8 gap-2">
                    <Button className="w-full col-span-7" data-umami-event="SignIn with Extension Button" onClick={handleExtensionLogin}>Sign in with Extension (NIP-07)</Button>
                    <Link target="_blank" href="https://www.getflamingo.org/">
                        <Button variant={"outline"}><InfoIcon /></Button>
                    </Link>
                </div>
                <div className="grid grid-cols-8 gap-2">
                    <Button className="w-full col-span-7" data-umami-event="SignIn with Amber Button" onClick={handleAmber}>Sign in with Amber</Button>
                    <Link target="_blank" href="https://github.com/greenart7c3/Amber">
                        <Button variant={"outline"}><InfoIcon /></Button>
                    </Link>
                </div>
                <hr />
                or
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Login with npub (read-only)</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-2">
                                <Label htmlFor="npub">npub</Label>
                                <Input placeholder="npub1..." id="npub" ref={npubInput} type="text" />
                                <Button className="w-full" data-umami-event="SignIn with npub Button" onClick={handleNpubLogin}>Sign in</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                or
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Login with nsec (not recommended)</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-2">
                                <Label htmlFor="nsec">nsec</Label>
                                <Input placeholder="nsecabcdefghijklmnopqrstuvwxyz" id="nsec" ref={nsecInput} type="password" />
                                <Button className="w-full" data-umami-event="SignIn with nsec Button" onClick={handleNsecLogin}>Sign in</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}