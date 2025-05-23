// Import package information dynamically
import packageInfo from "../package.json"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "LUMINA",
  version: packageInfo.version, // Use the version from package.json
  description:
    "A beautiful Nostr client for images.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  links: {
    twitter: "https://lumina.rocks/profile/npub1fq8vrf63vsrqjrwqgtwlvauqauc0yme6se8g8dqhcpf6tfs3equqntmzut",
    github: "https://github.com/mroxso/lumina-rocks-website",
    docs: "https://heynostr.com",
  },
}