import { ScrollArea } from "@/components/ui/scroll-area"
import ReactionButtonReactionListItem from "./ReactionButtonReactionListItem";

export default function ReactionButtonReactionList({ filteredEvents }: { filteredEvents: any }) {
    return (
        <ScrollArea className="px-4 h-[50vh]">
            {filteredEvents.map((event: any) => (
                <ReactionButtonReactionListItem key={event.id} event={event} />
            ))}
        </ScrollArea>
    );
}