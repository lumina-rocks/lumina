"use client";

import ReelFeed from "@/components/ReelFeed"
import { useEffect } from "react";

export default function ReelPage() {
  useEffect(() => {
    document.title = `Reels | LUMINA`;
    // Prevent scrolling on this page for a full-screen experience
    document.body.style.overflow = 'hidden';
    
    // Hide the header and bottom bar when on the reel page
    const topNav = document.querySelector('nav');
    const bottomBar = document.querySelector('.fixed.bottom-0');
    
    if (topNav) {
      (topNav as HTMLElement).style.display = 'none';
    }
    
    if (bottomBar) {
      (bottomBar as HTMLElement).style.display = 'none';
    }
    
    return () => {
      // Restore scrolling and show navigation elements when leaving the page
      document.body.style.overflow = '';
      
      if (topNav) {
        (topNav as HTMLElement).style.display = '';
      }
      
      if (bottomBar) {
        (bottomBar as HTMLElement).style.display = '';
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden z-50">
      <ReelFeed />
    </div>
  );
}
