import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="page-shell mt-24 pb-12">
      <div className="rule pt-10 md:flex md:items-start md:justify-between">
        <p className="label uppercase">
          {siteConfig.name} · {siteConfig.tagline}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 label uppercase md:mt-0">
          {siteConfig.footerLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-vermilion">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Image
        src={siteConfig.logo.footer.src}
        alt=""
        width={siteConfig.logo.footer.width}
        height={siteConfig.logo.footer.height}
        className="mt-16 h-auto w-[220px] md:w-[300px]"
      />
      <p className="mt-6 max-w-2xl label text-muted">
        Entries marked provisional were drafted from standard editions and scholarship and are awaiting specialist review. Decorative
        artwork on this site is modern and is never presented as a historical object; see{" "}
        <Link href="/library/credits" className="underline">
          image credits
        </Link>
        .
      </p>
    </footer>
  );
}
