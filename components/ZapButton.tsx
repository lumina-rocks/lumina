import {
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
import { ReloadIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import ZapButtonList from "./ZapButtonList";
import { Input } from "./ui/input";
import { useNostr, useNostrEvents, useProfile } from "nostr-react";
import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { Alert } from "./ui/alert";
import { signEvent } from "@/utils/utils";

export default function ZapButton({ event }: { event: any }) {

    let loginType = '';
    if (typeof window !== 'undefined') {
        loginType = window.localStorage.getItem("loginType") ?? '';
    }

    const { connectedRelays } = useNostr();

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
    const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
    const { publish } = useNostr();

    // Store the initial count of zap receipts when an invoice is generated
    const invoiceEventsCountRef = useRef<number>(0);

    // Effect to check for new zap receipts when showing an invoice
    useEffect(() => {
        if (invoice) {
            // Store the current count of zap receipts when invoice is generated
            invoiceEventsCountRef.current = events.length;
            setPaymentComplete(false);
        }
    }, [invoice]);

    // Effect to detect new zap receipts after invoice is shown
    useEffect(() => {
        if (invoice && events.length > invoiceEventsCountRef.current) {
            // Filter events to find new zap receipts related to current invoice
            const newEvents = events.slice(invoiceEventsCountRef.current);
            
            // Check if any new events contain the current invoice
            const relevantEvents = newEvents.filter(zapEvent => {
                // Look for bolt11 tag containing the invoice
                return zapEvent.tags.some(tag => 
                    tag[0] === 'bolt11' && invoice.includes(tag[1].substring(0, 50))
                );
            });

            if (relevantEvents.length > 0) {
                setPaymentComplete(true);
            }
        }
    }, [events, invoice]);

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

            try {
                // Add a timeout to the fetch request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(lnurl, { 
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                clearTimeout(timeoutId);
                
                // Check content type to ensure it's JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.error("Invalid content type:", contentType);
                    throw new Error("Lightning service returned invalid content type (expected JSON)");
                }
                
                // Parse response as JSON
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(`Error fetching LNURL info: ${data.reason || response.statusText || 'Unknown error'}`);
                }

                if (!data.callback) {
                    throw new Error("Invalid LNURL response: missing callback URL");
                }

                if (!data.allowsNostr) {
                    setErrorMessage("This Lightning address doesn't support Nostr zaps");
                    setIsProcessing(false);
                    return;
                }

                setLnurlPayInfo(data);
            } catch (error) {
                if (typeof error === "object" && error !== null && "name" in error && typeof (error as any).name === "string") {
                    if ((error as any).name === 'AbortError') {
                        throw new Error("Request timed out - Lightning service not responding");
                    } else if ((error as any).name === 'SyntaxError') {
                        throw new Error("Lightning service returned invalid data format");
                    }
                }
                if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string" && (error as any).message.includes('NetworkError')) {
                    throw new Error("Network error: CORS issue or service unavailable");
                } else {
                    throw error;
                }
            }
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

            let zapRequestEvent = {
                kind: 9734,
                content: "",
                tags: [
                    ["relays", ...connectedRelays.map((relay) => relay.url)],
                    ["amount", amount.toString()],
                    ["p", event.pubkey],
                    ["e", event.id],
                ],
                created_at: Math.floor(Date.now() / 1000),
                pubkey: senderPubkey,
                id: "", // Add placeholder for id
                sig: "", // Add placeholder for sig
            };

            let params = new URLSearchParams();
            params.append('amount', amount.toString());

            if (userData?.lud06) {
                zapRequestEvent.tags.push(["lnurl", userData.lud06]);
            }

            const signedZapRequest = await signEvent(loginType, zapRequestEvent);
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

    const checkPaymentStatus = async () => {
        setIsProcessing(true);
        try {
            // Force a re-fetch of zap receipt events
            const eventFilter = {
                '#e': [event.id],
                kinds: [9735],
            };
            
            // Manually check relays for new zap events
            const zapPromises = connectedRelays.map(async (relay) => {
                return new Promise(async (resolve) => {
                    const timeout = setTimeout(() => resolve([]), 3000); // 3 second timeout
                    try {
                        const sub = relay.sub([eventFilter]);
                        const events: any[] = [];
                        
                        sub.on('event', (event) => {
                            // Check if this event contains the current invoice
                            const hasBolt11 = event.tags.some(tag => 
                                tag[0] === 'bolt11' && invoice.includes(tag[1].substring(0, 50))
                            );
                            if (hasBolt11) {
                                events.push(event);
                            }
                        });
                        
                        sub.on('eose', () => {
                            clearTimeout(timeout);
                            resolve(events);
                            sub.unsub();
                        });
                    } catch (error) {
                        clearTimeout(timeout);
                        resolve([]);
                    }
                });
            });
            
            const zapEventsArrays = await Promise.all(zapPromises);
            const newZapEvents = zapEventsArrays.flat();
            
            if (newZapEvents.length > 0) {
                setPaymentComplete(true);
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
        } finally {
            setIsProcessing(false);
        }
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
                {errorMessage && (
                    <Alert variant={"destructive"}>
                        {errorMessage}
                    </Alert>
                )}

                {invoice ? (
                    <div className="flex flex-col items-center px-4 py-4">
                        {paymentComplete ? (
                            <div className="flex flex-col items-center justify-center mb-4 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 w-[200px] h-[200px]">
                                <CheckCircledIcon className="h-24 w-24 text-green-500" />
                                <p className="text-lg font-semibold text-green-500 mt-4">
                                    Payment Complete!
                                </p>
                            </div>
                        ) : (
                            <div className="mb-4 p-2 bg-white rounded-lg">
                                <Link href={`lightning:${invoice}`} target="_blank" rel="noopener noreferrer">
                                    <QRCode value={invoice} size={200} />
                                </Link>
                            </div>
                        )}
                        
                        <p className="text-sm text-center mb-4">
                            {paymentComplete 
                                ? "Your payment has been received and confirmed!" 
                                : "Scan this QR code with a Lightning wallet to pay the invoice"}
                        </p>
                        
                        <div className="w-full overflow-auto p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs mb-4">
                            <code className="break-all">{invoice}</code>
                        </div>
                        
                        {paymentComplete ? (
                            <div className="flex items-center text-green-500 mb-4">
                                <CheckCircledIcon className="mr-2 h-4 w-4" />
                                Zap sent successfully!
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                className="mb-4"
                                onClick={() => checkPaymentStatus()}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Checking...
                                    </>
                                ) : (
                                    "Check if paid"
                                )}
                            </Button>
                        )}
                        
                        <Button variant="outline" onClick={() => setInvoice("")}>
                            {paymentComplete ? "Send Another Zap" : "Back to Zap Options"}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="px-4 pt-4 grid grid-cols-3 gap-2">
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
            </DrawerContent>
        </Drawer>
    );
}