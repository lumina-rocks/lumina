"use client";

import ReelFeed from "@/components/ReelFeed"
import { useEffect } from "react";

export default function ReelPage() {
  useEffect(() => {
    document.title = `Reels | LUMINA`;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scrolling when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl">
        <ReelFeed />
      </div>
    </div>
  );
}
