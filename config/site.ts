export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "LUMINA",
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
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