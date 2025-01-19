"use client";

import { Search } from "@/components/Search";
import { useEffect } from "react";

export default function SearchMainPage() {
  useEffect(() => {
    document.title = `Search | LUMINA`;
  }, []);

  return (
    <>
      <div className="flex flex-col items-center py-6 px-6">
        <Search />
      </div>
    </>
  );
}
