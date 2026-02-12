export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "HireMe",
  description:
    "Local-first job outreach automation with human review and Ollama-powered personalization.",
  developer: {
    name: process.env.NEXT_PUBLIC_DEVELOPER_NAME ?? "codernotme",
    url: process.env.NEXT_PUBLIC_DEVELOPER_URL ?? "https://github.com/codernotme",
  },
  navItems: [
    {
      label: "Overview",
      href: "/",
    },
    {
      label: "How It Works",
      href: "/#how-it-works",
    },
    {
      label: "Status",
      href: "/#status",
    },
    {
      label: "Run",
      href: "/#run",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
  ],
  links: {
    github:
      process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/codernotme",
    twitter:
      process.env.NEXT_PUBLIC_TWITTER_URL ?? "https://x.com/intent/tweet",
    docs: process.env.NEXT_PUBLIC_DOCS_URL ?? "/docs",
    discord:
      process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.com/invite",
    supportEmail:
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@hireme.local",
  },
};
