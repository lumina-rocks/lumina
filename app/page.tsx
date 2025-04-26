"use client";

import { Search } from "@/components/Search";
import { TrendingImagesNew } from "@/components/TrendingImagesNew";
import { GeyserFundDonation } from "@/components/GeyserFundDonation";
import { useEffect } from "react";


export default function Home() {
  useEffect(() => {
    document.title = `LUMINA`;
  }, []);

  return (
    <>
      <div className="flex flex-col items-center px-6">
        <GeyserFundDonation />
      </div>
      <div className="flex flex-col items-center px-6">
        <Search />
      </div>
      <TrendingImagesNew />
    </>
  );
}