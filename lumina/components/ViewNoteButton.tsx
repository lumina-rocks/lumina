import { Button } from "@/components/ui/button";
import { SizeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { nip19 } from "nostr-tools";

export default function ViewNoteButton({ event }: { event: any }) {
    const encodedNoteId = nip19.noteEncode(event.id);
    return (
        <Link href={'/note/' + encodedNoteId} passHref>
            <Button variant="secondary"><SizeIcon /></Button>
        </Link>
    );
}