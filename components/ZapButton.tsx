import { useNostr, dateToUnix, useNostrEvents } from "nostr-react";

import {
    type Event as NostrEvent,
    getEventHash,
    getPublicKey,
    finalizeEvent,
} from "nostr-tools";
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
import { ReloadIcon } from "@radix-ui/react-icons";
import ZapButtonList from "./ZapButtonList";
import { Input } from "./ui/input";

export default function ZapButton({ event }: { event: any }) {
    const { events, isLoading } = useNostrEvents({
        filter: {
            // since: dateToUnix(now.current), // all new events from now
            // since: 0,
            // limit: 100,
            '#e': [event.id],
            kinds: [9735],
        },
    });

    // filter out all events that also have another e tag with another id
    // this will filter out likes that are made on comments and not on the note itself
    // const filteredEvents = events.filter((event) => { return event.tags.filter((tag) => { return tag[0] === '#e' && tag[1] !== event.id }).length === 0 });

    let sats = 0;
    var lightningPayReq = require('bolt11');
    events.forEach((event) => {
        // console.log(event);
        event.tags.forEach((tag) => {
            if (tag[0] === 'bolt11') {
                let decoded = lightningPayReq.decode(tag[1]);
                // console.log(decoded.satoshis);
                sats = sats + decoded.satoshis;
            }
        });
    });


    // const { publish } = useNostr();

    // const onPost = async () => {
    //     const privKey = prompt("Paste your private key:");

    //     if (!privKey) {
    //         alert("no private key provided");
    //         return;
    //     }

    //     const message = prompt("Enter the message you want to send:");

    //     if (!message) {
    //         alert("no message provided");
    //         return;
    //     }

    //     const event: NostrEvent = {
    //         content: message,
    //         kind: 1,
    //         tags: [],
    //         created_at: dateToUnix(),
    //         pubkey: getPublicKey(privKey),
    //         id: "",
    //         sig: ""
    //     };

    //     event.id = getEventHash(event);
    //     event.sig = getSignature(event, privKey);

    //     publish(event);
    // };

    return (
        <Drawer>
            <DrawerTrigger>
                {/* <Button variant="default" onClick={onPost}>{events.length} Reactions</Button> */}
                {isLoading ? (
                    <Button variant="outline"><ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> ⚡️</Button>
                ) : (
                    // <Button variant="outline">{events.length} ⚡️ ({sats} sats)</Button>
                    <Button variant="outline">{sats} sats ⚡️</Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Zaps</DrawerTitle>
                    {/* <DrawerDescription>Sorry, but this feature is not implemented yet.</DrawerDescription> */}
                </DrawerHeader>
                <div className="px-4 grid grid-cols-3">
                    <Button variant={"outline"} className="mx-1" disabled>1 sat</Button>
                    <Button variant={"outline"} className="mx-1" disabled>21 sats</Button>
                    <div className="flex">
                        <Input className="mx-1" placeholder="1000 sats" />
                        <Button variant={"outline"} className="mx-1" disabled>send</Button>
                    </div>
                </div>
                <hr className="my-4" />
                <ZapButtonList events={events} />
                <DrawerFooter>
                    <DrawerClose>
                        <Button variant={"outline"}>Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

        // <Button variant="default" onClick={onPost}>{events.length} Reactions</Button>
    );
}