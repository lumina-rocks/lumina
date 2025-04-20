import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { nip19 } from "nostr-tools"
import { Label } from "../ui/label"
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, Key, Copy, RefreshCw, ArrowRight } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

export function CreateSecretKeyForm() {
    const [nsec, setNsec] = useState('');
    const [npub, setNpub] = useState('');
    const [nsecCopied, setNsecCopied] = useState(false);
    const [npubCopied, setNpubCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(true);

    const regenerateKey = () => {
        setIsGenerating(true);
        
        // Add a small delay to show the loading state
        setTimeout(() => {
            let sk = generateSecretKey(); // `sk` is a Uint8Array
            let pk = getPublicKey(sk); // `pk` is a hex string
            let newNpub = nip19.npubEncode(pk); // `npub` is a string
            let newNsec = nip19.nsecEncode(sk); // `nsec` is a string

            setNsec(newNsec);
            setNpub(newNpub);
            setIsGenerating(false);
        }, 500);
    }

    const copyToClipboard = (text: string, setStateFunc: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text);
        setStateFunc(true);
        setTimeout(() => setStateFunc(false), 2000);
    };

    // Generate keys when the component is first rendered
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
        <div className="w-full space-y-6">
            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-400">Important security notice</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-500">
                    Your <b>secret key</b> gives full control of your account. It&apos;s stored locally in your browser
                    and never sent to any server. Make sure to back it up securely.
                </AlertDescription>
            </Alert>

            <Card className="border-muted">
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Key className="h-4 w-4" /> Your Secret Key (nsec)
                            </Label>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs"
                                onClick={() => copyToClipboard(nsec, setNsecCopied)}
                            >
                                {nsecCopied ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        <div className="relative">
                            <Input 
                                type="text" 
                                className="font-mono text-sm bg-muted/30" 
                                value={nsec} 
                                readOnly 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Key className="h-4 w-4" /> Your Public Key (npub)
                            </Label>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs"
                                onClick={() => copyToClipboard(npub, setNpubCopied)}
                            >
                                {npubCopied ? "Copied!" : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        <Input 
                            type="text" 
                            className="font-mono text-sm bg-muted/30" 
                            value={npub} 
                            readOnly
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3 pt-2">
                <Button 
                    variant="outline" 
                    onClick={regenerateKey}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Regenerate New Keys'}
                </Button>
                
                <Button 
                    onClick={() => {
                        localStorage.setItem('nsec', bytesToHex(nip19.decode(nsec).data as Uint8Array));
                        localStorage.setItem("loginType", "raw_nsec");
                        localStorage.setItem("pubkey", nip19.decode(npub).data.toString());
                        window.location.href = '/onboarding/createProfile';
                    }}
                    className="flex items-center gap-2"
                >
                    Continue to Profile Setup
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}