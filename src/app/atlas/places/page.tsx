import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getPlaces } from "@/server/queries";

export const metadata: Metadata = { title: "Places" };

/** Equirectangular projection cropped to Europe and the North Atlantic, plus an inset list for the Americas. */
const BOUNDS = { west: -12, east: 16, south: 42, north: 60 };

function project(lat: number, lon: number) {
  const x = ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100;
  const y = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * 100;
  return { x, y, inside: x >= 0 && x <= 100 && y >= 0 && y <= 100 };
}

export default async function PlacesPage() {
  const places = await getPlaces();
  const plotted = places.filter((p) => p.latitude != null && p.longitude != null).map((p) => ({ ...p, ...project(p.latitude!, p.longitude!) }));
  return (
    <>
      <PageHeader
        eyebrow="Atlas"
        title="Places"
        intro="Where the books and objects in the atlas are now kept or still stand. Positions are approximate (city or site level) and have not yet been checked against a gazetteer."
      />
      <div className="page-shell mt-12 grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <figure>
          <svg viewBox="0 0 100 64" className="w-full border border-rule" role="img" aria-label="Approximate locations in western Europe">
            {[0, 25, 50, 75, 100].map((x) => (
              <line key={`v${x}`} x1={x} x2={x} y1={0} y2={64} stroke="rgb(254 253 245 / 0.08)" strokeWidth={0.2} />
            ))}
            {[0, 16, 32, 48, 64].map((y) => (
              <line key={`h${y}`} y1={y} y2={y} x1={0} x2={100} stroke="rgb(254 253 245 / 0.08)" strokeWidth={0.2} />
            ))}
            {plotted
              .filter((p) => p.inside)
              .map((p) => (
                <g key={p.slug}>
                  <circle cx={p.x} cy={p.y * 0.64} r={0.9} fill="var(--color-vermilion)" />
                  <text x={p.x + 1.4} y={p.y * 0.64 + 0.8} fontSize={2.1} fill="var(--color-paper)" fontFamily="var(--font-ui)">
                    {p.name}
                  </text>
                </g>
              ))}
          </svg>
          <figcaption className="label mt-3 text-muted">
            Schematic plot, 12°W–16°E, 42°N–60°N. Places outside the frame: {plotted.filter((p) => !p.inside).map((p) => p.name).join(", ") || "none"}.
          </figcaption>
        </figure>
        <ul>
          {places.map((p) => (
            <li key={p.slug} className="border-b border-rule py-4">
              <p className="font-display text-[1.875rem]">{p.name}</p>
              <p className="label text-muted">{p.modernPlace}</p>
              <ul className="label mt-2 space-y-1">
                {p.manuscripts.map((m) => (
                  <li key={m.slug}>
                    <Link href={`/atlas/manuscripts/${m.slug}`} className="underline">
                      {m.title ?? m.shelfmark}
                    </Link>
                  </li>
                ))}
                {p.artworks.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/atlas/artworks/${a.slug}`} className="underline">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
