import React, { useState, useEffect } from 'react';
import TrendingImage from '@/components/TrendingImageNew';

export function TrendingImagesNew() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        // TODO: Change to luminas own relay
        fetch('https://scraper.highperfocused.tech/api/trending/kind20')
            .then(res => res.json())
            .then(data => setEvents(data.trending))
            .catch(error => {
                console.error('Error calling trending images:', error);
            });
    }, []);

    return (
        <div className="flex flex-col items-center py-6 px-6">
            <h1 className="text-3xl font-bold">Currently Trending</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {events && events.length > 0 && events.map((event, index) => (
                    <TrendingImage key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}