import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Textarea } from "./ui/textarea";
import { Share1Icon } from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import React, { useRef } from 'react';
import { useToast } from "./ui/use-toast";
import { Event as NostrEvent, nip19 } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";

interface ViewCopyButtonProps {
    event: NDKEvent;
}

export default function ViewCopyButton({ event }: ViewCopyButtonProps) {
    const inputRef = useRef(null);
    const inputRefID = useRef(null);
    const { toast } = useToast()
    
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast({
                description: 'URL copied to clipboard',
                title: 'Copied'
            });
        } catch (err) {
            toast({
                description: 'Error copying URL to clipboard',
                title: 'Error',
                variant: 'destructive'
            });
        }
    };
    
    const handleCopyNoteId = async () => {
        try {
            await navigator.clipboard.writeText(nip19.noteEncode(event.id));
            toast({
                description: 'Note ID copied to clipboard',
                title: 'Copied'
            });
        } catch (err) {
            toast({
                description: 'Error copying Note ID to clipboard',
                title: 'Error',
                variant: 'destructive'
            });
        }
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline"><Share1Icon /></Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Share this Note</DrawerTitle>
                    <DrawerDescription>Share this Note with others.</DrawerDescription>
                </DrawerHeader>
                <div className="px-2">
                    {/* <h1>URL</h1> */}
                    <div className="flex items-center mb-4">
                        <Input ref={inputRef} value={window.location.href} disabled className="mr-2" />
                        <Button variant="outline" onClick={handleCopyLink}>Copy Link</Button>
                    </div>
                    <div className="flex items-center mb-4">
                        <Input ref={inputRefID} value={nip19.noteEncode(event.id)} disabled className="mr-2" />
                        <Button variant="outline" onClick={handleCopyNoteId}>Copy Note ID</Button>
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <div>
                            <Button variant="outline">Close</Button>
                        </div>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}