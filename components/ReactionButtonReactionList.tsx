import { ScrollArea } from "@/components/ui/scroll-area"
import ReactionButtonReactionListItem from "./ReactionButtonReactionListItem";
import { NDKEvent } from '@nostr-dev-kit/ndk';

export default function ReactionButtonReactionList({ filteredEvents }: { filteredEvents: NDKEvent[] }) {
    return (
        <div className="px-4">
            <div className="space-y-4">
                {filteredEvents.map((event) => (
                    <ReactionButtonReactionListItem key={event.id} event={event.rawEvent()} />
                ))}
            </div>
        </div>
    );
}