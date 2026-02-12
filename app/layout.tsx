import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased app-shell",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-between flex-wrap gap-4 px-6 py-6 text-sm text-default-500">
              <span>
                HireMe - local-first job outreach automation by {" "}
                <Link
                  isExternal
                  className="text-default-500"
                  href={siteConfig.developer.url}
                >
                  {siteConfig.developer.name}
                </Link>
                .
              </span>
              <div className="flex items-center gap-4">
                <Link className="text-default-500" href="/docs">
                  Docs
                </Link>
                <Link className="text-default-500" href="/about">
                  About
                </Link>
                <Link
                  isExternal
                  className="text-default-500"
                  href={siteConfig.links.github}
                >
                  GitHub
                </Link>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
