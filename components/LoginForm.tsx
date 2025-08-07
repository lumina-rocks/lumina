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
import { useEffect, useRef, useState } from "react"
import { getPublicKey, generateSecretKey, nip19, SimplePool } from 'nostr-tools'
import { BunkerSigner, parseBunkerInput } from 'nostr-tools/nip46'
import { InfoIcon, Loader2, QrCode, X } from "lucide-react";
import Link from "next/link";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { fetchNip65Relays, mergeAndStoreRelays } from "@/utils/nip65Utils"
import { Html5Qrcode } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog"

export function LoginForm() {

    let publicKey = useRef(null);
    let nsecInput = useRef<HTMLInputElement>(null);
    let npubInput = useRef<HTMLInputElement>(null);
    let bunkerUrlInput = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBunkerLoading, setIsBunkerLoading] = useState(false);
    const [isExtensionLoading, setIsExtensionLoading] = useState(false);
    const [isAmberLoading, setIsAmberLoading] = useState(false);
    const [isNsecLoading, setIsNsecLoading] = useState(false);
    const [isNpubLoading, setIsNpubLoading] = useState(false);
    const [bunkerError, setBunkerError] = useState<string | null>(null);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const qrScannerRef = useRef<any>(null);

    // Default relays to query for NIP-65 data
    const defaultRelays = [
        "wss://relay.nostr.band",
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.nostr.ch"
    ];

    // Helper function to load NIP-65 relays for a user
    const loadNip65Relays = async (pubkey: string) => {
        try {
            const nip65Relays = await fetchNip65Relays(pubkey, defaultRelays);
            
            if (nip65Relays.length > 0) {
                mergeAndStoreRelays(nip65Relays);
                console.log(`Loaded ${nip65Relays.length} relays from NIP-65 for user ${pubkey}`);
            } else {
                console.log(`No NIP-65 relays found for user ${pubkey}`);
            }
        } catch (error) {
            console.error("Error loading NIP-65 relays:", error);
        }
    };

    // Function to complete login process
    const completeLogin = async (pubkey: string, loginType: string, redirect = true) => {
        try {
            localStorage.setItem("pubkey", pubkey);
            localStorage.setItem("loginType", loginType);
            
            await loadNip65Relays(pubkey);
            
            if (redirect) {
                window.location.href = `/profile/${nip19.npubEncode(pubkey)}`;
            }
        } catch (error) {
            console.error("Error completing login:", error);
            setIsLoading(false);
            setIsBunkerLoading(false);
            setIsExtensionLoading(false);
            setIsAmberLoading(false);
            setIsNsecLoading(false);
            setIsNpubLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const amberResponse = urlParams.get('amberResponse');
        if (amberResponse !== null) {
            setIsAmberLoading(true);
            completeLogin(amberResponse, "amber");
        }

        if (window.location.hash && window.location.hash.startsWith('#nostrconnect://')) {
            handleNostrConnect(window.location.hash.substring(1));
        }

        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop().catch(console.error);
            }
        };
    }, [completeLogin]);

    // Handle QR Scanner dialog
    const startQRScanner = () => {
        setIsQRDialogOpen(true);
        setTimeout(() => {
            setIsScanning(true);
            const qrContainer = document.getElementById('qr-reader');
            
            if (qrContainer) {
                const html5QrCode = new Html5Qrcode("qr-reader");
                qrScannerRef.current = html5QrCode;
                
                html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        if (decodedText) {
                            html5QrCode.stop().catch(console.error);
                            setIsQRDialogOpen(false);
                            setIsScanning(false);
                            
                            if (bunkerUrlInput.current) {
                                bunkerUrlInput.current.value = decodedText;
                            }
                        }
                    },
                    (errorMessage) => {
                        console.error("QR Scan error:", errorMessage);
                    }
                ).catch(error => {
                    console.error("Starting QR Scanner failed:", error);
                    setIsScanning(false);
                });
            }
        }, 300);
    };

    const stopQRScanner = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop().catch(console.error);
        }
        setIsScanning(false);
        setIsQRDialogOpen(false);
    };

    // Handle NIP-46 connection initiated by bunker
    const handleNostrConnect = async (url: string) => {
        try {
            setIsLoading(true);
            setIsBunkerLoading(true);
            setBunkerError(null);
            
            const localSecretKey = generateSecretKey();
            const localSecretKeyHex = bytesToHex(localSecretKey);
            
            const bunkerUrl = url.includes('://') ? url : `nostrconnect://${url}`;
            const bunkerPointer = await parseBunkerInput(bunkerUrl);
            
            if (!bunkerPointer) {
                throw new Error('Invalid bunker URL');
            }
            
            const pool = new SimplePool();
            const bunker = new BunkerSigner(localSecretKey, bunkerPointer, { pool });
            
            try {
                await bunker.connect();
                
                const userPubkey = await bunker.getPublicKey();
                
                localStorage.setItem("bunkerLocalKey", localSecretKeyHex);
                localStorage.setItem("bunkerUrl", bunkerUrl);
                
                await bunker.close();
                pool.close([]);
                
                await completeLogin(userPubkey, "bunker", true);
            } catch (err) {
                console.error("Bunker connection error:", err);
                setBunkerError("Failed to connect to bunker. Please check the URL and try again.");
                await bunker.close().catch(console.error);
                pool.close([]);
                setIsBunkerLoading(false);
            }
        } catch (err) {
            console.error("Bunker parsing error:", err);
            setBunkerError("Invalid bunker URL format.");
            setIsBunkerLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBunkerLogin = async () => {
        if (bunkerUrlInput.current && bunkerUrlInput.current.value) {
            const bunkerUrl = bunkerUrlInput.current.value.trim();
            await handleNostrConnect(bunkerUrl);
        } else {
            setBunkerError("Please enter a bunker URL");
        }
    };

    const handleAmber = async () => {
        try {
            setIsAmberLoading(true);
            setIsLoading(true);
            const hostname = window.location.host;
            console.log(hostname);
            if (!hostname) {
                throw new Error("Hostname is null or undefined");
            }
            const intent = `intent:#Intent;scheme=nostrsigner;S.compressionType=none;S.returnType=signature;S.type=get_public_key;S.callbackUrl=http://${hostname}/login?amberResponse=;end`;
            window.location.href = intent;
        } catch (error) {
            console.error("Error launching Amber:", error);
            setIsAmberLoading(false);
            setIsLoading(false);
        }
    }

    const handleExtensionLogin = async () => {
        try {
            setIsExtensionLoading(true);
            setIsLoading(true);
            if (window.nostr !== undefined) {
                publicKey.current = await window.nostr.getPublicKey()
                console.log("Logged in with pubkey: ", publicKey.current);
                if (publicKey.current !== null) {
                    await completeLogin(publicKey.current, "extension");
                } else {
                    throw new Error("Failed to get public key from extension");
                }
            } else {
                throw new Error("Nostr extension not detected");
            }
        } catch (error) {
            console.error("Extension login error:", error);
            setIsExtensionLoading(false);
            setIsLoading(false);
        }
    };

    const handleNsecLogin = async () => {
        if (nsecInput.current !== null) {
            try {
                setIsNsecLoading(true);
                setIsLoading(true);
                let input = nsecInput.current.value;
                if(input.includes("nsec")) {
                    input = bytesToHex(nip19.decode(input).data as Uint8Array);
                    console.log('decoded nsec: ' + input);
                }
                let nsecBytes = hexToBytes(input);
                let nsecHex = bytesToHex(nsecBytes);
                let pubkey = getPublicKey(nsecBytes);

                localStorage.setItem("nsec", nsecHex);
                await completeLogin(pubkey, "raw_nsec");
            } catch (e) {
                console.error(e);
                setIsNsecLoading(false);
                setIsLoading(false);
            }
        }
    };

    const handleNpubLogin = async () => {
        if (npubInput.current !== null) {
            try {
                setIsNpubLoading(true);
                setIsLoading(true);
                let input = npubInput.current.value;
                let npub = null;
                let pubkey = null;
                if(input.startsWith("npub1")) {
                    npub = input;
                    pubkey = nip19.decode(input).data.toString();
                } else {
                    pubkey = input;
                    npub = nip19.npubEncode(input);
                }

                await completeLogin(pubkey, "readOnly_npub");
            } catch (e) {
                console.error(e);
                setIsNpubLoading(false);
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Login to Lumina</CardTitle>
                    <CardDescription>
                        Login to your account with nostr extension, bunker, or with your nsec.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-8 gap-2">
                        <Button 
                            className="w-full col-span-7" 
                            onClick={handleExtensionLogin} 
                            disabled={isLoading || isExtensionLoading}
                        >
                            {isExtensionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : "Sign in with Extension (NIP-07)"}
                        </Button>
                        <Link target="_blank" href="https://www.getflamingo.org/">
                            <Button variant={"outline"} disabled={isLoading}><InfoIcon /></Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                        <Button 
                            className="w-full col-span-7" 
                            onClick={handleAmber} 
                            disabled={isLoading || isAmberLoading}
                        >
                            {isAmberLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : "Sign in with Amber"}
                        </Button>
                        <Link target="_blank" href="https://github.com/greenart7c3/Amber">
                            <Button variant={"outline"} disabled={isLoading}><InfoIcon /></Button>
                        </Link>
                    </div>
                    <hr />
                    or
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Login with Bunker (NIP-46)</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-2">
                                    <Label htmlFor="bunkerUrl">Bunker URL</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="bunker://... or nostrconnect://..." 
                                            id="bunkerUrl" 
                                            ref={bunkerUrlInput} 
                                            type="text"
                                            disabled={isLoading || isBunkerLoading} 
                                            className="flex-1"
                                        />
                                        <Button 
                                            variant="outline" 
                                            onClick={startQRScanner} 
                                            disabled={isLoading || isBunkerLoading}
                                            title="Scan QR code"
                                        >
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {bunkerError && <p className="text-red-500 text-sm">{bunkerError}</p>}
                                    <Button 
                                        className="w-full" 
                                        onClick={handleBunkerLogin} 
                                        disabled={isLoading || isBunkerLoading}
                                    >
                                        {isBunkerLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : "Sign in with Bunker"}
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        Use a NIP-46 compatible bunker URL that starts with bunker:// or nostrconnect://
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    or
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Login with npub (read-only)</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-2">
                                    <Label htmlFor="npub">npub</Label>
                                    <Input 
                                        placeholder="npub1..." 
                                        id="npub" 
                                        ref={npubInput} 
                                        type="text" 
                                        disabled={isLoading || isNpubLoading}
                                    />
                                    <Button 
                                        className="w-full" 
                                        onClick={handleNpubLogin}
                                        disabled={isLoading || isNpubLoading}
                                    >
                                        {isNpubLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : "Sign in"}
                                    </Button>
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
                                    <Input 
                                        placeholder="nsecabcdefghijklmnopqrstuvwxyz" 
                                        id="nsec" 
                                        ref={nsecInput} 
                                        type="password" 
                                        disabled={isLoading || isNsecLoading}
                                    />
                                    <Button 
                                        className="w-full" 
                                        onClick={handleNsecLogin}
                                        disabled={isLoading || isNsecLoading}
                                    >
                                        {isNsecLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : "Sign in"}
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                <CardFooter>
                </CardFooter>
            </Card>
            
            {/* QR Code Scanner Dialog */}
            <Dialog open={isQRDialogOpen} onOpenChange={(open) => {
                if (!open) stopQRScanner();
                setIsQRDialogOpen(open);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan Bunker QR Code</DialogTitle>
                        <DialogDescription>
                            Position the QR code in the camera view to scan your bunker URL.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center">
                        <div id="qr-reader" style={{ width: '100%', maxWidth: '500px' }}></div>
                        {isScanning ? (
                            <p className="text-sm text-center mt-2">Scanning...</p>
                        ) : (
                            <p className="text-sm text-center mt-2">Starting camera...</p>
                        )}
                    </div>
                    <div className="flex justify-center">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={stopQRScanner}>
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}