"use client";

import GlobalFeed from "@/components/GlobalFeed";
import { useEffect } from "react";

export default function GlobalFeedPage() {

  useEffect(() => {
    document.title = `Global Feed | LUMINA`;
  }, []);

  return (
    <div className="py-4 px-2 md:py-6 md:px-6">
      <GlobalFeed />
    </div>
  );
}
