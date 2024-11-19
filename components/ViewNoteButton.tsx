import { Button } from "@/components/ui/button";
import { SizeIcon } from "@radix-ui/react-icons";
import { nip19 } from "nostr-tools";

export default function ViewNoteButton({ event }: { event: any }) {
    const encodedNoteId = nip19.noteEncode(event.id);
    return (
        <Button variant="secondary" onClick={() => window.location.href = '/note/'+encodedNoteId}><SizeIcon /></Button>
    );
}