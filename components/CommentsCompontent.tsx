import React from 'react';
import { useNostrEvents } from "nostr-react";
import {
    nip19,
} from "nostr-tools";
import CommentCard from '@/components/CommentCard';

interface CommentsCompontentProps {
    pubkey: string;
    event: any;
}

const CommentsCompontent: React.FC<CommentsCompontentProps> = ({ pubkey, event }) => {

    const { events } = useNostrEvents({
        filter: {
            kinds: [1],
            '#e': [event.id],
        },
    });

    // filter out all events with more than 1 "e" tag. other tags are ok
    // this shows only the top level comments
    let filteredEvents = events.filter((event) => {
        return event.tags.filter((tag) => tag[0] === 'e').length === 1;
    });

    return (
        <>
            <h1 className='text-xl'>Comments</h1>
            {filteredEvents.map((event) => (
                <div key={event.id} className="py-6">
                    <CommentCard key={event.id} pubkey={event.pubkey} text={event.content} eventId={event.id} tags={event.tags} event={event} />
                </div>
            ))}
        </>
    );
}

export default CommentsCompontent;