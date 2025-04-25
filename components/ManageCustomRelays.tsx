"use client";

import { useEffect, useState } from "react";
import { useNostr } from "nostr-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export function ManageCustomRelays() {
  const [customRelays, setCustomRelays] = useState<string[]>([]);
  const { toast } = useToast();
  const { connectedRelays } = useNostr();

  useEffect(() => {
    // Load custom relays from localStorage
    const storedRelays = JSON.parse(localStorage.getItem("customRelays") || "[]");
    setCustomRelays(storedRelays);
  }, []);

  const handleRemoveRelay = (relayUrl: string) => {
    // Filter out the relay to remove
    const updatedRelays = customRelays.filter(url => url !== relayUrl);
    
    // Update state and localStorage
    setCustomRelays(updatedRelays);
    localStorage.setItem("customRelays", JSON.stringify(updatedRelays));
    
    toast({
      title: "Relay removed",
      description: "The relay has been removed from your list. Refresh to apply changes.",
      variant: "default",
    });
  };

  // Check if a relay is currently connected
  const isConnected = (relayUrl: string) => {
    // Normalize the URL by removing trailing slash
    const normalizedRelayUrl = relayUrl.endsWith('/') ? relayUrl.slice(0, -1) : relayUrl;
    
    return connectedRelays?.some(relay => {
      // Normalize connected relay URL too
      const normalizedConnectedUrl = relay.url.endsWith('/') ? relay.url.slice(0, -1) : relay.url;
      return normalizedConnectedUrl === normalizedRelayUrl && relay.status === 1;
    }) || false;
  };

  if (customRelays.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Custom Relays</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customRelays.map((relayUrl) => (
            <div key={relayUrl} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div>
                  <p className="font-medium truncate">{relayUrl}</p>
                  <div className="mt-1">
                    {isConnected(relayUrl) ? (
                      <Badge className="bg-green-500">Connected</Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRelay(relayUrl)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2">
            Note: Refresh the page after adding or removing relays to apply changes to connections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}