import { useNostr, dateToUnix, useNostrEvents } from "nostr-react";

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
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ReloadIcon } from "@radix-ui/react-icons";
import ReactionButtonReactionList from "./ReactionButtonReactionList";
import { FormEvent } from "react";
import { createHash } from "crypto";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

export default function ReactionButton({ event }: { event: any }) {
    const { publish } = useNostr();

    const loginType = typeof window !== 'undefined' ? window.localStorage.getItem('loginType') : null;
    const pubkey = typeof window !== 'undefined' ? window.localStorage.getItem('pubkey') : null;

    const { events, isLoading } = useNostrEvents({
        filter: {
            '#e': [event.id],
            kinds: [7],
        },
    });

    let eventLiked = false;
    let eventLikedEvent = null;
    for(event of events) {
        console.log(event.pubkey)
        if(event.pubkey == pubkey ) {
            eventLiked = true;
            eventLikedEvent = event;
            break;
        }
    }
    if(eventLiked) {
        console.log("EVENT LIKED!")
        // if(eventLikedEvent.content === '💜' || eventLikedEvent.content === '+') {
        document.getElementById("heartReactionButton")?.classList.add("bg-purple-400");
        document.getElementById("upReactionButton")?.classList.remove("bg-purple-400");
        document.getElementById("downReactionButton")?.classList.remove("bg-purple-400");
        // }
        document.getElementById("reactionButton")?.classList.add("bg-blue-500");
    }

    const filteredEvents = events.filter((event) => { return event.tags.filter((tag) => { return tag[0] === '#e' && tag[1] !== event.id }).length === 0 });

    async function onSubmit(content: string) {
        const createdAt = Math.floor(Date.now() / 1000);

        var tags: [[String, any]] = event.tags.filter((tag: [string]) => tag.length >= 2 && (tag[0] == "e" || tag[0] == "p"));
        tags.push(["e", event.id]);
        tags.push(["p", event.pubkey]);
        tags.push(["k", event.kind]);

        let noteEvent = {
          kind: 7,
          content: content,
          tags: tags,
          created_at: createdAt,
        };
    
        let signedEvent: NostrEvent | null = null;
    
        if (loginType === 'extension') {
          signedEvent = await window.nostr.signEvent(noteEvent);
        } else if (loginType === 'amber') {
          alert('Signing with Amber is not implemented yet, sorry!');
        } else if (loginType === 'raw_nsec') {
          if (typeof window !== 'undefined') {
            let nsecStr = null;
            nsecStr = window.localStorage.getItem('nsec');
            if (nsecStr != null) {
              signedEvent = finalizeEvent(noteEvent, hexToBytes(nsecStr));
            }
          }
        }
    
        if (signedEvent) {
          console.log("final Event: ")
          console.log(signedEvent)
          publish(signedEvent);
        }
    
        if (signedEvent != null) {
            if(content === "💜") {
                document.getElementById("heartReactionButton")?.classList.add("bg-purple-100");
                document.getElementById("upReactionButton")?.classList.remove("bg-purple-100");
                document.getElementById("downReactionButton")?.classList.remove("bg-purple-100");
            }
        }
      }

    return (
        <Drawer>
            <DrawerTrigger>
                {isLoading ? (
                    <Button id="reactionButton" variant="default"><ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> 💜</Button>
                ) : (
                    <Button id="reactionButton" variant="default">{filteredEvents.length} 💜</Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Reactions</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 grid grid-cols-3">
                    <Button id="heartReactionButton" variant={"outline"} className="mx-1" onClick={() => onSubmit("💜")}>💜</Button>
                    <Button id='upReactionButton' variant={"outline"} className="mx-1" onClick={() => onSubmit("👍")}>👍</Button>
                    <Button id='downReactionButton' variant={"outline"} className="mx-1" onClick={() => onSubmit("👎")}>👎</Button>
                </div>
                <hr className="my-4" />
                <ReactionButtonReactionList filteredEvents={filteredEvents} />
                <DrawerFooter>
                    <DrawerClose>
                        <Button variant={"secondary"}>Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}