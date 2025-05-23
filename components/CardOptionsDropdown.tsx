import React from 'react';
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

interface CardOptionsDropdownProps {
    event: NostrEvent;
}

export default function CardOptionsDropdown({ event }: CardOptionsDropdownProps) {
    const jsonEvent = JSON.stringify(event, null, 2);
    const inputRef = useRef(null);
    const inputRefID = useRef(null);
    const { toast } = useToast();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const [rawDrawerOpen, setRawDrawerOpen] = useState(false);
    
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
        </>
    );
}
