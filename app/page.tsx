"use client";

import { Search } from "@/components/Search";
import { WelcomeContent } from "@/components/WelcomeContent";
import { GeyserFundDonation } from "@/components/GeyserFundDonation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = `LUMINA`;
  }, []);

  // Check for environment variable - Next.js exposes public env vars with NEXT_PUBLIC_ prefix
  const showGeyserFund = process.env.NEXT_PUBLIC_SHOW_GEYSER_FUND === 'true';

  return (
    <>
      {showGeyserFund && (
        <div className="flex flex-col items-center px-6">
          <GeyserFundDonation />
        </div>
      )}
      <div className="flex flex-col items-center py-4 px-6">
        <Search />
      </div>
      <WelcomeContent />
    </>
  );
}