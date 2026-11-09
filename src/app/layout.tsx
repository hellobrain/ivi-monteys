import type { Metadata, Viewport } from "next";
import "@fontsource/benne/400.css";
import "@fontsource/averia-serif-libre/300.css";
import "@fontsource/averia-serif-libre/300-italic.css";
import "@fontsource/averia-serif-libre/700.css";
import "@fontsource/archivo-narrow/400.css";
import "@fontsource/cedarville-cursive/400.css";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} · ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { siteName: siteConfig.name, type: "website" },
};

export const viewport: Viewport = { themeColor: siteConfig.colors.ink };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
