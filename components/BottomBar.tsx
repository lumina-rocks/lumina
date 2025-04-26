"use client";

import { BellIcon, GlobeIcon, HomeIcon, RowsIcon, UploadIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { FormEvent, JSX, SVGProps, useEffect, useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { SearchIcon, TagIcon } from "lucide-react";

export default function BottomBar() {
  const router = useRouter();
  const [pubkey, setPubkey] = useState<null | string>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setPubkey(window.localStorage.getItem('pubkey'));
  }, []);

  const isActive = (path: string, currentPath: string) => currentPath === path ? 'text-purple-500' : '';

  // Render minimal navigation during SSR and hydration
  if (!mounted) {
    return (
      <nav className="fixed inset-x-0 bottom-0 h-14 flex flex-row shrink-0 items-center justify-between border-t bg-background/90 shadow-up-4 z-50 backdrop-blur">
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/', pathname)}`} href="/">
          <HomeIcon className={`h-6 w-6`} />
          <span className="sr-only">Home</span>
        </Link>
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/global', pathname)}`} href="/global">
          <GlobeIcon className={`h-6 w-6`} />
          <span className="sr-only">Global</span>
        </Link>
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/search', pathname)}`} href="/search">
          <SearchIcon className={`h-6 w-6`} />
          <span className="sr-only">Search</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 h-14 flex flex-row shrink-0 items-center justify-between border-t bg-background/90 shadow-up-4 z-50 backdrop-blur">
      <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/', pathname)}`} href="/">
        <HomeIcon className={`h-6 w-6`} />
        <span className="sr-only">Home</span>
      </Link>
      {pubkey && (
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/feed', pathname)}`} href="/feed">
          <RowsIcon className={`h-6 w-6`} />
          <span className="sr-only">Follower Feed</span>
        </Link>
      )}
      <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/global', pathname)}`} href="/global">
        <GlobeIcon className={`h-6 w-6`} />
        <span className="sr-only">Global</span>
      </Link>
      {pubkey && window.localStorage.getItem('loginType') != 'readOnly_npub' && (
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/upload', pathname)}`} href="/upload">
          <UploadIcon className={`h-6 w-6`} />
          <span className="sr-only">Upload</span>
        </Link>
      )}
      {/* {pubkey && ( */}
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/tag', pathname)}`} href="/tag">
          <TagIcon className={`h-6 w-6`} />
          <span className="sr-only">Tags</span>
        </Link>
      {/* )} */}
      <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/search', pathname)}`} href="/search">
        <SearchIcon className={`h-6 w-6`} />
        <span className="sr-only">Search</span>
      </Link>
      {pubkey && (
        <Link className={`flex flex-col items-center justify-center w-full text-xs gap-1 px-4 ${isActive('/notifications', pathname)}`} href="/notifications">
          <BellIcon className={`h-6 w-6`} />
          <span className="sr-only">Notifications</span>
        </Link>
      )}
    </nav>
  )
}