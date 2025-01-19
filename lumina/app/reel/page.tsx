"use client";

import ReelFeed from "@/components/ReelFeed"
import { useEffect } from "react";

export default function ReelPage() {
  useEffect(() => {
    document.title = `Reels | LUMINA`;
  }, []);

  return (
    <div className="py-6 px-6">
      <ReelFeed />
    </div>
  );
}
