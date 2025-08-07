"use client";

import React, { useState, useEffect } from 'react';
import TrendingImage from '@/components/TrendingImageNew';
import { Spinner } from '@/components/spinner';

export function TrendingImagesNew() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        fetch('https://relay.lumina.rocks/api/trending/kind20')
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
                {events && events.length > 0 ? (
                    events.map((event) => (
                        <TrendingImage key={event.id} event={event} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-lg flex flex-col items-center gap-4">
                        <Spinner />
                        Curating Trending Images for you.. 💜
                    </div>
                )}
            </div>
        </div>
    );
}