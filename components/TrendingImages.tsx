import React, { useState, useEffect } from 'react';
import TrendingImage from './TrendingImage';
import { useNDK } from '@/hooks/useNDK';

export function TrendingImages() {
    const ndk = useNDK();
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        fetch('https://api.nostr.band/v0/trending/images')
            .then(res => res.json())
            .then(data => {
                // Pre-fetch events to have them in NDK cache
                data.images.forEach((image: any) => {
                    ndk.getEvent(image.id);
                });
                setImages(data.images);
            })
            .catch(error => {
                console.error('Error calling trending images:', error);
            });
    }, [ndk]);

    return (
        <div className="flex flex-col items-center py-6 px-6">
            <h1 className="text-3xl font-bold">Currently Trending</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {images && images.length > 0 && images.map((image, index) => (
                    <TrendingImage key={index} eventId={image.id} pubkey={image.pubkey} />
                ))}
            </div>
        </div>
    );
}