import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "./ui/textarea";
import { DotsVerticalIcon, CodeIcon, Share1Icon } from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { useRef, useState } from 'react';
import { useToast } from "./ui/use-toast";
import { Event as NostrEvent, nip19 } from "nostr-tools";
import { Trash2 } from "lucide-react";
import { useNostr } from "nostr-react";
import { signEvent } from "@/utils/utils";

interface CardOptionsDropdownProps {
    event: NostrEvent;
}

export default function CardOptionsDropdown({ event }: CardOptionsDropdownProps) {
    const jsonEvent = useMemo(() => JSON.stringify(event, null, 2), [event]);
    const inputRef = useRef(null);
    const inputRefID = useRef(null);
    const { toast } = useToast();
    const { publish } = useNostr();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const [rawDrawerOpen, setRawDrawerOpen] = useState(false);
    const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    
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
    
    const handleRequestDeletion = async () => {
        // Check if the user is the owner of the event
        const userPubkey = window.localStorage.getItem('pubkey');
        if (!userPubkey) {
            toast({
                description: 'You need to be logged in to request deletion',
                title: 'Error',
                variant: 'destructive'
            });
            return;
        }

        if (userPubkey !== event.pubkey) {
            toast({
                description: 'You can only request deletion of your own posts',
                title: 'Error',
                variant: 'destructive'
            });
            return;
        }

        const loginType = window.localStorage.getItem('loginType');
        if (!loginType) {
            toast({
                description: 'Login type is missing. Please log in again.',
                title: 'Error',
                variant: 'destructive'
            });
            return;
        }

        // Create a kind 5 event (deletion request) as per NIP-09
        const deletionEvent: NostrEvent = {
            kind: 5,
            created_at: Math.floor(Date.now() / 1000),
            content: deleteReason,
            tags: [
                ["e", event.id],
                ["k", event.kind.toString()]
            ],
            pubkey: "",
            id: "",
            sig: "",
        };

        // Sign the event
        const signedEvent = await signEvent(loginType, deletionEvent);

        if (signedEvent) {
            // Publish the deletion request
            publish(signedEvent);
            
            toast({
                description: 'Deletion request has been published',
                title: 'Success'
            });
            
            setDeleteDrawerOpen(false);
        } else {
            toast({
                description: 'Failed to sign deletion request',
                title: 'Error',
                variant: 'destructive'
            });
        }
    };

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto" aria-label="Options">
                        <DotsVerticalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Share option */}
                    <DropdownMenuItem 
                        onClick={() => {
                            setDropdownOpen(false);
                            setTimeout(() => setShareDrawerOpen(true), 100);
                        }}
                    >
                        <Share1Icon className="mr-2 h-4 w-4" />
                        Share
                    </DropdownMenuItem>

                    {/* View Raw option */}
                    <DropdownMenuItem 
                        onClick={() => {
                            setDropdownOpen(false);
                            setTimeout(() => setRawDrawerOpen(true), 100);
                        }}
                    >
                        <CodeIcon className="mr-2 h-4 w-4" />
                        View Raw
                    </DropdownMenuItem>

                    {/* Delete option (only visible for the owner) */}
                    {window.localStorage.getItem('pubkey') === event.pubkey && (
                        <DropdownMenuItem 
                            onClick={() => {
                                setDropdownOpen(false);
                                setTimeout(() => setDeleteDrawerOpen(true), 100);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Request Deletion
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Share Drawer */}
            <Drawer open={shareDrawerOpen} onOpenChange={setShareDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Share this Note</DrawerTitle>
                        <DrawerDescription>Share this Note with others.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                        <div className="flex items-center mb-4">
                            <Input ref={inputRef} value={window.location.href} readOnly className="mr-2" />
                            <Button variant="outline" onClick={handleCopyLink}>Copy Link</Button>
                        </div>
                        <div className="flex items-center mb-4">
                            <Input ref={inputRefID} value={nip19.noteEncode(event.id)} readOnly className="mr-2" />
                            <Button variant="outline" onClick={handleCopyNoteId}>Copy Note ID</Button>
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Raw Event Drawer */}
            <Drawer open={rawDrawerOpen} onOpenChange={setRawDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Raw Event</DrawerTitle>
                        <DrawerDescription>This shows the raw event data.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        <Textarea rows={20} readOnly value={jsonEvent} />
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Deletion Request Drawer */}
            <Drawer open={deleteDrawerOpen} onOpenChange={setDeleteDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Request Deletion</DrawerTitle>
                        <DrawerDescription>
                            This will publish a deletion request (NIP-09) for this event. Clients and relays may hide or delete this event when they see your request.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        <div className="space-y-2 mb-4">
                            <label htmlFor="delete-reason" className="text-sm font-medium">
                                Reason for deletion (optional)
                            </label>
                            <Textarea 
                                id="delete-reason"
                                placeholder="Why do you want to delete this event?"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="bg-muted p-3 rounded-md text-sm mb-4">
                            <p className="font-medium mb-1">Note:</p>
                            <p className="text-muted-foreground">
                                Deletion requests cannot be guaranteed to remove content from all relays and clients. 
                                Some relays may choose to ignore deletion requests, and previously downloaded content may still be available in clients.
                            </p>
                        </div>
                    </div>
                    <DrawerFooter className="flex-row space-x-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button 
                            variant="destructive" 
                            onClick={handleRequestDeletion}
                        >
                            Request Deletion
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
