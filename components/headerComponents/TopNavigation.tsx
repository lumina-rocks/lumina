"use client"

import { siteConfig } from "@/config/site"
import { useEffect, useState } from "react"
import { TopNavigationItems } from "./TopNavigationItems"
import { DropdownThemeMode } from "./DropdownThemeMode"
import LoginButton from "./LoginButton"
import { AvatarDropdown } from "./AvatarDropdown"
import RegisterButton from "./RegisterButton"
import GitHubButton from "@/components/headerComponents/GitHubButton"

export function TopNavigation() {
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setPubkey(window.localStorage.getItem("pubkey"))
  }, [])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return (
      <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <TopNavigationItems items={siteConfig.mainNav} />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <GitHubButton />
              <DropdownThemeMode />
            </nav>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <TopNavigationItems items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <GitHubButton />
            <DropdownThemeMode />
            {pubkey === null ? <RegisterButton /> : null}
            {pubkey === null ? <LoginButton /> : null}
            {pubkey !== null ? <AvatarDropdown /> : null}
          </nav>
        </div>
      </div>
    </header>
  )
}

