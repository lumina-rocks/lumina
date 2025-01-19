"use client";

import { Search } from "@/components/Search";
import { TrendingAccounts } from "@/components/TrendingAccounts";
import { TrendingImages } from "@/components/TrendingImages";
import { useEffect } from "react";


export default function Home() {
  useEffect(() => {
    document.title = `LUMINA`;
  }, []);
  
  return (
    <>
      <div className="flex flex-col items-center py-6 px-6">
        <Search />
      </div>
      {/* <TrendingAccounts /> */}
      <TrendingImages />
    </>
  );
}
