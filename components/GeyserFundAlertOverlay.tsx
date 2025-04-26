"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function GeyserFundAlertOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Check if the feature is enabled via environment variable
  const showGeyserFund = process.env.NEXT_PUBLIC_SHOW_GEYSER_FUND === 'true';
  
  // Show the alert after a short delay for better UX, but only if enabled
  useEffect(() => {
    if (!showGeyserFund) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [showGeyserFund]);
  
  // Store dismissal in localStorage to avoid showing again in the same session
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("geyserAlertDismissed", "true");
  };
  
  // Check if user has already dismissed
  useEffect(() => {
    const isDismissed = localStorage.getItem("geyserAlertDismissed") === "true";
    if (isDismissed) {
      setIsVisible(false);
    }
  }, []);
  
  // Don't render anything if the feature is disabled or not visible
  if (!showGeyserFund || !isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-fade-in mb-14">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
        <div className="relative p-5">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss alert"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col space-y-3">
            <div className="bg-white/10 px-3 py-1 rounded-full w-fit text-xs font-medium text-white">
              Limited Time Offer
            </div>
            
            <h3 className="text-xl font-bold text-white">Support the Geyser Fund</h3>
            
            <p className="text-white/90 text-sm">
              Join our community initiative to preserve natural geysers. Every donation helps protect these natural wonders for future generations.
            </p>
            
            <div className="flex justify-between items-center pt-2">
              <Button 
                onClick={() => window.open("/donate", "_blank")}
                className="bg-white text-purple-700 hover:bg-white/90 transition-colors group"
              >
                Donate Now
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <button 
                onClick={handleDismiss} 
                className="text-white/70 text-sm hover:text-white transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar animation to create urgency */}
        <div className="h-1 bg-white/20">
          <div className="h-full bg-white w-full animate-shrink origin-left"></div>
        </div>
      </div>
    </div>
  );
}
