/**
 * URL safety helpers. External links and images are rendered only when they
 * are absolute http(s) URLs; images additionally require an allow-listed host.
 */

const DEFAULT_IMAGE_HOSTS = [
  "iiif.bodleian.ox.ac.uk",
  "iiif.bl.uk",
  "www.e-codices.unifr.ch",
  "gallica.bnf.fr",
  "media.getty.edu",
  "images.metmuseum.org",
  "upload.wikimedia.org",
  "www.abdn.ac.uk",
];

export function imageHostAllowlist(): string[] {
  const env = process.env.IMAGE_HOST_ALLOWLIST;
  if (!env) return DEFAULT_IMAGE_HOSTS;
  return env
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function parseHttpUrl(value: string | null | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function isSafeExternalUrl(value: string | null | undefined): boolean {
  return parseHttpUrl(value) !== null;
}

/** Local paths (/brand/…) are always allowed; remote images must be https and allow-listed. */
export function isAllowedImageUrl(value: string | null | undefined, allowlist = imageHostAllowlist()): boolean {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  const url = parseHttpUrl(value);
  if (!url || url.protocol !== "https:") return false;
  return allowlist.includes(url.hostname.toLowerCase());
}

/** Only allow internal app paths for post-login redirects. */
export function safeRedirectPath(value: string | null | undefined, fallback = "/account"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
