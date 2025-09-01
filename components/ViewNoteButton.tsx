import { Button } from "@/components/ui/button";
import { SizeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { nip19 } from "nostr-tools";

export default function ViewNoteButton({ event }: { event: any }) {
    // Create nevent with relay hints
    const nevent = nip19.neventEncode({
        id: event.id,
        relays: event.relays || []
    });
    return (
        <Link href={'/note/' + nevent} passHref>
            <Button variant="secondary"><SizeIcon /></Button>
        </Link>
    );
}