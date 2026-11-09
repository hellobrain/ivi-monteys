/**
 * Brand and site settings. "BESTIARIUM" is the project codename; the public
 * brand below follows the selected Figma direction (Home 02 · Big letter).
 * Change anything here without touching components.
 */
export const siteConfig = {
  codename: "BESTIARIUM",
  name: "Feral Folio",
  tagline: "An illustrated guide to medieval bestiaries",
  description:
    "A museum of the page: the beasts of the medieval bestiaries, the texts that described them and the hands that drew them.",
  logo: {
    primary: { src: "/brand/logo-vermilion.png", width: 361, height: 104 },
    footer: { src: "/brand/logo-block.png", width: 300, height: 86 },
  },
  /** Oversized display words used by the homepage composition. */
  display: {
    hero: "BEAST",
    stackedTop: "FOL",
    stackedBottom: "IO",
    manifesto: ["LOOK", "CLOSELY", "READ SLOWLY"],
    signoff: "so they said.",
  },
  colors: {
    ink: "#020101",
    paper: "#fefdf5",
    graphite: "#2e2c2b",
    vermilion: "#ee4f1f",
    oxblood: "#6e1f1b",
    moss: "#5f6b3a",
    stone: "#b9b2a5",
  },
  nav: [
    { href: "/animals", label: "Creatures" },
    { href: "/symbols", label: "Symbols" },
    { href: "/atlas", label: "Atlas" },
    { href: "/learn", label: "Course" },
    { href: "/library", label: "Library" },
  ],
  primaryCta: { href: "/animals", label: "Open the bestiary" },
  footerLinks: [
    { href: "/library/sources", label: "Sources" },
    { href: "/library/credits", label: "Image credits" },
    { href: "/about", label: "About" },
    { href: "/account", label: "Account" },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;
