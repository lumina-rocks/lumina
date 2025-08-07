import { Search } from "@/components/Search";
import { TrendingImagesNew } from "@/components/TrendingImagesNew";
import { GeyserFundDonation } from "@/components/GeyserFundDonation";

export default function Home() {
  const showGeyserFund = process.env.NEXT_PUBLIC_SHOW_GEYSER_FUND === "true";

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
      <TrendingImagesNew />
    </>
  );
}