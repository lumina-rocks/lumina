"use client";

import { useState } from "react";
import { useNostr } from "nostr-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddRelaySheetProps {
  onRelayAdded: () => void;
}

export function AddRelaySheet({ onRelayAdded }: AddRelaySheetProps) {
  const [relayUrl, setRelayUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { connectedRelays } = useNostr();

  const handleAddRelay = () => {
    // Basic validation
    if (!relayUrl) {
      toast({
        title: "Invalid relay URL",
        description: "Please enter a relay URL",
        variant: "destructive",
      });
      return;
    }

    // Format URL
    let formattedUrl = relayUrl;
    if (!formattedUrl.startsWith("wss://")) {
      formattedUrl = `wss://${formattedUrl}`;
    }

    // Check if relay already exists in connected relays
    const existingRelays = connectedRelays?.map(relay => relay.url) || [];
    if (existingRelays.includes(formattedUrl)) {
      toast({
        title: "Relay already exists",
        description: "This relay is already in your list",
        variant: "destructive",
      });
      return;
    }

    // Get existing custom relays from localStorage
    const customRelays = JSON.parse(localStorage.getItem("customRelays") || "[]");
    
    // Add new relay to the list if not already in custom relays
    if (!customRelays.includes(formattedUrl)) {
      customRelays.push(formattedUrl);
      localStorage.setItem("customRelays", JSON.stringify(customRelays));
      
      toast({
        title: "Relay added",
        description: "The relay has been added to your list. Refresh to connect.",
        variant: "default",
      });
      
      // Reset form and close sheet
      setRelayUrl("");
      setIsOpen(false);
      
      // Call the callback to notify parent component
      onRelayAdded();
    } else {
      toast({
        title: "Relay already exists",
        description: "This relay is already in your custom list",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Relay
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Relay</SheetTitle>
          <SheetDescription>
            Enter the URL of a Nostr relay to add to your connection list.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="relay-url"
              placeholder="wss://relay.example.com"
              value={relayUrl}
              onChange={(e) => setRelayUrl(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Relay URLs typically start with wss:// but you can omit it if needed.
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRelay}>
              Add Relay
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}