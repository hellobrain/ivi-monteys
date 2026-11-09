export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string | null; children?: React.ReactNode }) {
  return (
    <header className="page-shell pt-16 md:pt-24">
      {eyebrow && <p className="label text-muted">{eyebrow}</p>}
      <h1 className="display mt-3 text-[clamp(3.5rem,9vw,8.5rem)]">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl text-[1.1875rem] leading-[1.5]">{intro}</p>}
      {children}
    </header>
  );
}

export function SectionTitle({ children, aside, id }: { children: React.ReactNode; aside?: React.ReactNode; id?: string }) {
  return (
    <div className="rule mt-20 flex items-baseline justify-between gap-4 pt-10" id={id}>
      <h2 className="display text-[clamp(2.25rem,4.5vw,4rem)]">{children}</h2>
      {aside && <div className="label shrink-0 text-right">{aside}</div>}
    </div>
  );
}
