/**
 * IIIF helpers (Image API 2/3 and Presentation API 2/3). Pure functions: no
 * network access. Fetching manifests happens server-side elsewhere and only
 * for allow-listed hosts.
 */

export type IiifSize = "max" | "full" | { width?: number; height?: number };

export function iiifImageUrl(
  service: string,
  opts: { region?: string; size?: IiifSize; rotation?: number; quality?: string; format?: string } = {},
): string {
  const base = service.replace(/\/+$/, "").replace(/\/info\.json$/, "");
  const region = opts.region ?? "full";
  let size: string;
  if (!opts.size || opts.size === "max") size = "max";
  else if (opts.size === "full") size = "full";
  else size = `${opts.size.width ?? ""},${opts.size.height ?? ""}`;
  return `${base}/${region}/${size}/${opts.rotation ?? 0}/${opts.quality ?? "default"}.${opts.format ?? "jpg"}`;
}

export function iiifThumbnailUrl(service: string, width = 600): string {
  return iiifImageUrl(service, { size: { width } });
}

export interface ManifestCanvas {
  id: string;
  label: string;
  imageService?: string;
  width?: number;
  height?: number;
}

type Json = Record<string, unknown>;

function labelText(label: unknown): string {
  if (typeof label === "string") return label;
  if (Array.isArray(label)) return label.map(labelText).join(" ");
  if (label && typeof label === "object") {
    const obj = label as Json;
    if ("@value" in obj) return String(obj["@value"]);
    const first = Object.values(obj)[0];
    if (Array.isArray(first)) return first.join(" ");
  }
  return "";
}

function serviceId(service: unknown): string | undefined {
  const s = Array.isArray(service) ? service[0] : service;
  if (!s || typeof s !== "object") return undefined;
  const obj = s as Json;
  return (obj.id ?? obj["@id"]) as string | undefined;
}

/** Extract canvases from a IIIF Presentation 2 or 3 manifest. */
export function parseManifest(manifest: unknown): { label: string; canvases: ManifestCanvas[] } {
  const m = (manifest ?? {}) as Json;
  const label = labelText(m.label);
  const canvases: ManifestCanvas[] = [];

  // Presentation 3: items → AnnotationPage → Annotation → body.service
  if (Array.isArray(m.items)) {
    for (const c of m.items as Json[]) {
      const page = (c.items as Json[] | undefined)?.[0];
      const anno = (page?.items as Json[] | undefined)?.[0];
      const body = anno?.body as Json | undefined;
      canvases.push({
        id: String(c.id ?? ""),
        label: labelText(c.label),
        imageService: serviceId(body?.service),
        width: c.width as number | undefined,
        height: c.height as number | undefined,
      });
    }
  }
  // Presentation 2: sequences[0].canvases[].images[0].resource.service
  else if (Array.isArray(m.sequences)) {
    const seq = (m.sequences as Json[])[0];
    for (const c of (seq?.canvases as Json[] | undefined) ?? []) {
      const img = (c.images as Json[] | undefined)?.[0];
      const resource = img?.resource as Json | undefined;
      canvases.push({
        id: String(c["@id"] ?? ""),
        label: labelText(c.label),
        imageService: serviceId(resource?.service),
        width: c.width as number | undefined,
        height: c.height as number | undefined,
      });
    }
  }
  return { label, canvases };
}
