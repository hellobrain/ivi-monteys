import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { siteConfig } from "@/config/site";
import styles from "./home.module.css";

type Box = { x: number; y: number; w?: number; h?: number; fs?: number; fmin?: number };

/** Positions an element in design units at ≥1280px; normal flow below. */
function at({ x, y, w, h, fs, fmin }: Box): { className: string; style: CSSProperties } {
  const style: Record<string, string | number> = { "--x": x, "--y": y };
  const cls = [styles.abs];
  if (w !== undefined) {
    style["--w"] = w;
    cls.push(styles.w);
  }
  if (h !== undefined) {
    style["--hh"] = h;
    cls.push(styles.hh);
  }
  if (fs !== undefined) {
    style["--fs"] = fs;
    if (fmin) style["--fmin"] = `${fmin}px`;
    cls.push(styles.fs);
  }
  return { className: cls.join(" "), style: style as CSSProperties };
}

function Positioned({ box, className = "", children, as: Tag = "div" }: { box: Box; className?: string; children: ReactNode; as?: "div" | "p" }) {
  const p = at(box);
  return (
    <Tag className={`${p.className} ${className}`} style={p.style}>
      {children}
    </Tag>
  );
}

function Art({ src, box, width, height, className = "" }: { src: string; box: Box; width: number; height: number; className?: string }) {
  const p = at(box);
  return (
    <div className={`${p.className} ${className}`} style={p.style} aria-hidden="true">
      <Image src={src} alt="" width={width} height={height} className="h-auto w-full object-cover xl:h-full" sizes="(min-width: 1280px) 30vw, 90vw" />
    </div>
  );
}

export interface TicketLesson {
  number: number;
  title: string;
  href: string;
  durationMinutes: number | null;
  sourceCount: number;
  creatureCount: number;
}

function Ticket({ lesson, thumb, rotate }: { lesson: TicketLesson; thumb: string; rotate: number }) {
  return (
    <Link
      href={lesson.href}
      className={`${styles.ticket} text-[14px] sm:text-[16px] xl:text-[calc(16*var(--u))]`}
      style={{ "--r": `${rotate}deg` } as CSSProperties}
    >
      <span className="flex h-full gap-[1em] p-[1em] xl:p-[1em]">
        <Image src={thumb} alt="" width={167} height={183} className="h-[10.5em] w-[9.375em] shrink-0 object-cover" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col justify-between py-[0.25em]">
          <span>
            <span className="block font-ui text-[0.875em] uppercase text-graphite">Lesson {String(lesson.number).padStart(2, "0")}</span>
            <span className="mt-[0.15em] block font-display text-[1.875em] leading-[1.05]">{lesson.title}</span>
          </span>
          <span className="flex gap-[1.5em] text-[0.875em] leading-[1.3] text-graphite">
            <span className="font-ui">
              Duration
              <br />
              {lesson.durationMinutes ?? "–"} min
            </span>
            <span className="font-serif">
              Includes
              <br />
              {lesson.sourceCount} sources · {lesson.creatureCount} {lesson.creatureCount === 1 ? "creature" : "creatures"}
            </span>
          </span>
        </span>
        <span className={`${styles.barcode} my-[0.5em] h-[9.375em] shrink-0 max-sm:hidden`} aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} />
          ))}
        </span>
      </span>
    </Link>
  );
}

export function HomePoster({ lessons, continueSlot }: { lessons: TicketLesson[]; continueSlot?: ReactNode }) {
  const [hero, stackTop, stackBottom] = [siteConfig.display.hero, siteConfig.display.stackedTop, siteConfig.display.stackedBottom];
  const [m1, m2, m3] = siteConfig.display.manifesto;
  const [read, slowly] = m3.split(" ");
  const ticketBoxes: Box[] = [
    { x: 620, y: 691, w: 578, h: 257 },
    { x: 640, y: 951, w: 573, h: 239 },
  ];
  const thumbs = ["/art/ticket-bird.png", "/art/ticket-lion-blue.png"];
  const rotations = [-6, -4];

  return (
    <section className={styles.canvas} style={{ "--h": 2540 } as CSSProperties} aria-labelledby="home-title">
      <h1 id="home-title" className="sr-only">
        {siteConfig.name}: {siteConfig.tagline}
      </h1>

      {/* Hero */}
      <div className={`${styles.flowPad} max-xl:pt-10`}>
        <Positioned box={{ x: 100, y: 50, w: 200 }} className={`${styles.small} label`}>
          <Link href="/animals" className="hover:text-vermilion">
            explore
            <br />
            creatures
          </Link>
        </Positioned>
        <Positioned box={{ x: 1060, y: 20, w: 300 }} as="p" className={`${styles.body} max-xl:mt-6 max-xl:max-w-md max-xl:ml-auto`}>
          {siteConfig.description}
        </Positioned>
      </div>

      <div className="relative max-xl:mt-4">
        <Positioned
          box={{ x: 730, y: 120, w: 1400, fs: 400 }}
          className={`${styles.bigWord} ${styles.center} text-center max-xl:text-[27vw]`}
        >
          <span aria-hidden="true">{hero}</span>
        </Positioned>
        <Art
          src="/art/winged-beast.png"
          width={386}
          height={462}
          box={{ x: 501.55, y: 200, w: 385.24, h: 461.84 }}
          className="z-10 max-xl:mx-auto max-xl:-mt-[14vw] max-xl:w-[62vw] max-xl:max-w-[385px]"
        />
      </div>

      <div className={styles.flowPad}>
        <Positioned box={{ x: 300, y: 550, w: 200 }} className={`${styles.small} label max-xl:mt-6`}>
          <Link href="/about" className="hover:text-vermilion">
            museum of the page
          </Link>
        </Positioned>
      </div>

      {/* Short course */}
      <div className={`${styles.flowPad} max-xl:mt-16`}>
        <Positioned box={{ x: 150, y: 650, w: 220 }} className={`${styles.small} label`}>
          <Link href="/learn" className="hover:text-vermilion">
            short course
          </Link>
          {continueSlot}
        </Positioned>
      </div>
      <div aria-hidden="true" className="max-xl:-ml-[8vw] max-xl:mt-2">
        <Positioned box={{ x: -130, y: 690, w: 600, fs: 240 }} className={`${styles.bigWord} max-xl:text-[34vw]`}>
          {stackTop}
        </Positioned>
        <Positioned box={{ x: -60, y: 910, w: 600, fs: 240 }} className={`${styles.bigWord} max-xl:ml-[6vw] max-xl:text-[34vw]`}>
          {stackBottom}
        </Positioned>
      </div>
      <div className="relative max-xl:mt-6">
        <Art src="/art/procession.png" width={1020} height={620} box={{ x: 420, y: 670, w: 1020, h: 620 }} className="max-xl:w-full" />
        <div className={`${styles.flowPad} max-xl:-mt-[30vw] max-xl:relative max-xl:space-y-4`}>
          {lessons.slice(0, 2).map((lesson, i) => (
            <Positioned key={lesson.href} box={ticketBoxes[i]} className="z-10 max-xl:max-w-[35rem]">
              <Ticket lesson={lesson} thumb={thumbs[i]} rotate={rotations[i]} />
            </Positioned>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className={`${styles.flowPad} max-xl:mt-20 max-xl:grid max-xl:gap-4 sm:max-xl:grid-cols-[1fr_2fr]`}>
        <Positioned box={{ x: 300, y: 1434, w: 200 }} className={`${styles.small} label`}>
          how it works
        </Positioned>
        <Positioned box={{ x: 640, y: 1430, w: 300 }} as="p" className={`${styles.body} max-xl:max-w-sm`}>
          Every entry gives you the old texts in translation, the pictures from different books, and what readers took the beast to mean.
        </Positioned>
      </div>
      <div className={`${styles.flowPad} max-xl:mt-8 max-xl:grid max-xl:grid-cols-2 max-xl:gap-4`}>
        <Art src="/art/maned-beast.png" width={240} height={340} box={{ x: 640, y: 1530, w: 240, h: 340 }} />
        <Art src="/art/striding-lion.png" width={240} height={340} box={{ x: 920, y: 1530, w: 240, h: 340 }} />
        <Positioned box={{ x: 920, y: 1890, w: 260 }} as="p" className={`${styles.body} max-xl:col-span-2 max-xl:max-w-xs max-xl:justify-self-end`}>
          Look past the claws. The appetite, the habits, even the colour of the fur were read as signs.{" "}
          <Link href="/animals/lion" className="whitespace-nowrap underline decoration-vermilion">
            Read the lion →
          </Link>
        </Positioned>
      </div>
      <Art src="/art/climber.png" width={260} height={180} box={{ x: -40, y: 1870, w: 300, h: 180 }} className="max-xl:mt-10 max-xl:w-[70vw] max-xl:max-w-[300px]" />

      {/* Manifesto */}
      <div aria-label={siteConfig.display.manifesto.join(", ")} role="img" className={`${styles.flowPad} max-xl:mt-10`}>
        <Positioned box={{ x: 300, y: 2070, w: 400, fs: 120 }} className={`${styles.bigWord} max-xl:text-[15vw]`}>
          {m1}
        </Positioned>
        <Positioned box={{ x: 520, y: 2180, w: 600, fs: 120 }} className={`${styles.bigWord} max-xl:ml-[12vw] max-xl:text-[15vw]`}>
          {m2}
        </Positioned>
        <Positioned box={{ x: 820, y: 2290, w: 620, fs: 120 }} className={`${styles.bigWord} max-xl:ml-[28vw] max-xl:text-[15vw]`}>
          {read}
          <br />
          {slowly}
        </Positioned>
      </div>
    </section>
  );
}
