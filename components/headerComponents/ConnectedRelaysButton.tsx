"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { useNostr } from "nostr-react";
import { Wifi } from "lucide-react";

export default function ConnectedRelaysButton() {
    const { connectedRelays } = useNostr();
    const [relayCount, setRelayCount] = useState<number>(0);
    const [isConnecting, setIsConnecting] = useState<boolean>(true);

    useEffect(() => {
        // Update relay count when connectedRelays changes
        if (connectedRelays && connectedRelays.length > 0) {
            // Count only connected relays (status === 1)
            const activeRelays = connectedRelays.filter(relay => relay.status === 1).length;
            setRelayCount(activeRelays);
            
            // If at least one relay is connected, we're no longer in connecting state
            if (activeRelays > 0) {
                setIsConnecting(false);
            }
        }
        
        // Set a timeout to stop showing "Connecting..." after a reasonable time
        const timer = setTimeout(() => {
            setIsConnecting(false);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [connectedRelays]);

    return (
        <Link href={"/relays"}>
            <Button variant={"outline"} className="gap-2">
                <Wifi className={`h-4 w-4 ${isConnecting ? 'animate-pulse' : ''}`} />
                {isConnecting && relayCount === 0 ? 'Connecting...' : `${relayCount}`}
            </Button>
        </Link>
    );
}