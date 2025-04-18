import {
    type Event as NostrEvent,
    getEventHash,
    getPublicKey,
    finalizeEvent,
    nip19,
} from "nostr-tools";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ReloadIcon } from "@radix-ui/react-icons";
import ZapButtonList from "./ZapButtonList";
import { Input } from "./ui/input";
import { useNostr, useNostrEvents, useProfile, dateToUnix } from "nostr-react";
import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

export default function ZapButton({ event }: { event: any }) {
    const { events, isLoading } = useNostrEvents({
        filter: {
            '#e': [event.id],
            kinds: [9735],
        },
    });

    const [lnurlPayInfo, setLnurlPayInfo] = useState<any>(null);
    const [invoice, setInvoice] = useState<string>("");
    const [customAmount, setCustomAmount] = useState<string>("1000");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { publish } = useNostr();

    const { data: userData } = useProfile({
        pubkey: event.pubkey,
    });

    let sats = 0;
    var lightningPayReq = require('bolt11');
    events.forEach((event) => {
        event.tags.forEach((tag) => {
            if (tag[0] === 'bolt11') {
                let decoded = lightningPayReq.decode(tag[1]);
                sats = sats + decoded.satoshis;
            }
        });
    });

    const fetchLnurlInfo = async () => {
        setErrorMessage("");
        if (!userData?.lud06 && !userData?.lud16) {
            setErrorMessage("This user doesn't have a Lightning address configured");
            return;
        }

        try {
            setIsProcessing(true);
            
            let lnurl;
            
            if (userData.lud06) {
                lnurl = userData.lud06;
            } else if (userData.lud16) {
                const [name, domain] = userData.lud16.split('@');
                if (!name || !domain) {
                    throw new Error("Invalid lightning address format");
                }
                const url = `https://${domain}/.well-known/lnurlp/${name}`;
                lnurl = url;
            } else {
                throw new Error("No lightning address found in profile");
            }

            if (lnurl.toLowerCase().startsWith('lnurl')) {
                try {
                    lnurl = bech32ToUrl(lnurl);
                } catch (e) {
                    console.error("Error decoding LNURL:", e);
                    throw new Error("Invalid LNURL format");
                }
            }

            const response = await fetch(lnurl);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`Error fetching LNURL info: ${data.reason || 'Unknown error'}`);
            }

            if (!data.allowsNostr) {
                setErrorMessage("This Lightning address doesn't support Nostr zaps");
                setIsProcessing(false);
                return;
            }

            setLnurlPayInfo(data);
        } catch (error) {
            console.error("Error fetching LNURL info:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to fetch Lightning payment information");
        } finally {
            setIsProcessing(false);
        }
    };

    const createZapRequest = async (amount: number) => {
        if (!lnurlPayInfo || !lnurlPayInfo.callback || !lnurlPayInfo.allowsNostr || !lnurlPayInfo.nostrPubkey) {
            setErrorMessage("Invalid Lightning payment information");
            return;
        }

        if (amount < lnurlPayInfo.minSendable || amount > lnurlPayInfo.maxSendable) {
            setErrorMessage(`Amount must be between ${lnurlPayInfo.minSendable / 1000} and ${lnurlPayInfo.maxSendable / 1000} sats`);
            return;
        }

        try {
            setIsProcessing(true);
            setErrorMessage("");

            let senderPubkey = '';
            if (typeof window !== 'undefined') {
                senderPubkey = window.localStorage.getItem('pubkey') ?? '';
            }

            if (!senderPubkey) {
                setErrorMessage("You need to be logged in to send zaps");
                setIsProcessing(false);
                return;
            }

            const relays = [
                "wss://relay.nostr.ch",
                "wss://nostr-pub.wellorder.net",
            ];

            let zapRequestEvent = {
                kind: 9734,
                content: "",
                tags: [
                    ["relays", ...relays],
                    ["amount", amount.toString()],
                    ["p", event.pubkey],
                    ["e", event.id],
                ],
                created_at: Math.floor(Date.now() / 1000),
                pubkey: senderPubkey,
            };

            let params = new URLSearchParams();
            params.append('amount', amount.toString());

            if (userData?.lud06) {
                zapRequestEvent.tags.push(["lnurl", userData.lud06]);
            }

            const signEvent = async () => {
                if (window.nostr) {
                    return await window.nostr.signEvent(zapRequestEvent);
                } else {
                    const nsecHex = window.localStorage.getItem("nsec");
                    if (nsecHex) {
                        try {
                            const decoded = nip19.decode(nsecHex);
                            if (decoded.type === 'nsec') {
                                const privateKey = decoded.data as Uint8Array;
                                return finalizeEvent(zapRequestEvent, privateKey);
                            }
                        } catch (error) {
                            console.error("Error decoding private key:", error);
                            throw new Error("Invalid private key format");
                        }
                    }
                    throw new Error("No private key available to sign the zap request");
                }
            };

            const signedZapRequest = await signEvent();
            
            params.append('nostr', JSON.stringify(signedZapRequest));
            
            if (userData?.lud06) {
                params.append('lnurl', userData.lud06);
            }
            
            let callbackUrl = `${lnurlPayInfo.callback}?${params.toString()}`;
            
            const invoiceResponse = await fetch(callbackUrl);
            const invoiceData = await invoiceResponse.json();
            
            if (!invoiceResponse.ok || !invoiceData.pr) {
                throw new Error(`Failed to get invoice: ${invoiceData.reason || 'Unknown error'}`);
            }
            
            setInvoice(invoiceData.pr);
        } catch (error) {
            console.error("Error creating zap request:", error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to create zap request");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleZap = async (amountSats: number) => {
        if (!lnurlPayInfo) {
            await fetchLnurlInfo();
        }
        createZapRequest(amountSats * 1000);
    };

    const handleCustomZap = async () => {
        const amount = parseInt(customAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            setErrorMessage("Please enter a valid amount");
            return;
        }
        
        if (!lnurlPayInfo) {
            await fetchLnurlInfo();
        }
        createZapRequest(amount * 1000);
    };

    const bech32ToUrl = (lnurl: string): string => {
        try {
            const decoded = nip19.decode(lnurl);
            return decoded.data as string;
        } catch (e) {
            return lnurl;
        }
    };

    const handleOpenDrawer = () => {
        fetchLnurlInfo();
    };

    const handleCloseDrawer = () => {
        setInvoice("");
        setErrorMessage("");
        setIsProcessing(false);
    };

    return (
        <Drawer onOpenChange={(open) => open ? handleOpenDrawer() : handleCloseDrawer()}>
            <DrawerTrigger asChild>
                {isLoading ? (
                    <Button variant="outline"><ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> ⚡️</Button>
                ) : (
                    <Button variant="outline">{sats} sats ⚡️</Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Zaps</DrawerTitle>
                </DrawerHeader>

                {errorMessage && (
                    <div className="px-4 py-2 mb-4 text-red-500 bg-red-50 rounded">
                        {errorMessage}
                    </div>
                )}

                {invoice ? (
                    <div className="flex flex-col items-center px-4 py-4">
                        <div className="mb-4 p-2 bg-white rounded-lg">
                            <QRCode value={invoice} size={200} />
                        </div>
                        <p className="text-sm text-center mb-4">
                            Scan this QR code with a Lightning wallet to pay the invoice
                        </p>
                        <div className="w-full overflow-auto p-2 bg-gray-100 rounded text-xs mb-4">
                            <code className="break-all">{invoice}</code>
                        </div>
                        <Button variant="outline" onClick={() => setInvoice("")}>
                            Back to Zap Options
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="px-4 grid grid-cols-3 gap-2">
                            <Button 
                                variant={"outline"} 
                                className="mx-1" 
                                onClick={() => handleZap(1)}
                                disabled={isProcessing || !lnurlPayInfo}
                            >
                                1 sat
                            </Button>
                            <Button 
                                variant={"outline"} 
                                className="mx-1" 
                                onClick={() => handleZap(21)}
                                disabled={isProcessing || !lnurlPayInfo}
                            >
                                21 sats
                            </Button>
                            <div className="flex">
                                <Input 
                                    className="mx-1" 
                                    placeholder="1000 sats" 
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    disabled={isProcessing}
                                />
                                <Button 
                                    variant={"outline"} 
                                    className="mx-1"
                                    onClick={handleCustomZap}
                                    disabled={isProcessing || !lnurlPayInfo}
                                >
                                    {isProcessing ? <ReloadIcon className="h-4 w-4 animate-spin" /> : "send"}
                                </Button>
                            </div>
                        </div>

                        <hr className="my-4" />
                        <ZapButtonList events={events} />
                    </>
                )}

                <DrawerFooter>
                    <DrawerClose asChild>
                        <div>
                            <Button variant={"outline"}>Close</Button>
                        </div>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}