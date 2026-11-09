import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 pt-4 md:px-[30px] md:pt-[25px]">
        <Link href="/" className="shrink-0" aria-label={`${siteConfig.name}, home`}>
          <Image
            src={siteConfig.logo.primary.src}
            alt={siteConfig.name}
            width={siteConfig.logo.primary.width}
            height={siteConfig.logo.primary.height}
            priority
            className="h-auto w-[180px] md:w-[260px] xl:w-[361px]"
          />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex gap-[1.1rem] font-serif text-[18px] uppercase tracking-[var(--tracking-nav)]">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-vermilion">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/search" className="label-caps hover:text-vermilion">
            Search
          </Link>
          <Link href="/account" className="label-caps hover:text-vermilion">
            Account
          </Link>
          <Link href={siteConfig.primaryCta.href} className="pill">
            {siteConfig.primaryCta.label}
          </Link>
        </div>

        {/* Mobile navigation works without JavaScript. */}
        <details className="group relative lg:hidden">
          <summary className="pill cursor-pointer list-none [&::-webkit-details-marker]:hidden">Menu</summary>
          <nav aria-label="Primary mobile" className="absolute right-0 mt-3 w-64 border border-rule bg-ink p-5">
            <ul className="space-y-3 font-serif text-lg uppercase tracking-[var(--tracking-nav)]">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/search">Search</Link>
              </li>
              <li>
                <Link href="/account">Account</Link>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
