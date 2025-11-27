import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import { NIP19Page } from "./pages/NIP19Page";
import { Upload } from "./pages/Upload";
import { Hashtags } from "./pages/Hashtags";
import { TagPage } from "./pages/TagPage";
import { SearchPage } from "./pages/Search";
import { Notifications } from "./pages/Notifications";
import Messages from "./pages/Messages";
import { Settings } from "./pages/Settings";
import { ProfileSettings } from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/hashtags" element={<Hashtags />} />
        <Route path="/tag/:tag" element={<TagPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;