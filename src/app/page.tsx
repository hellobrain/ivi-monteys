import Link from "next/link";
import { Suspense } from "react";
import { HomePoster } from "@/components/home/home-poster";
import { ExploreIndex, ManyHands, SignOff } from "@/components/home/home-rest";
import { getDb } from "@/db/client";
import { getCurrentUser } from "@/server/auth/session";
import { getHomeData } from "@/server/queries";
import { getContinueLesson } from "@/server/repo/user";

export default async function HomePage() {
  const data = await getHomeData();
  const lessons = data.lessons.map((l) => ({
    number: l.number,
    title: l.title,
    href: `/learn/${l.blockSlug}/${l.slug}`,
    durationMinutes: l.durationMinutes,
    sourceCount: l.sourceCount,
    creatureCount: l.creatureCount,
  }));

  return (
    <>
      <HomePoster
        lessons={lessons}
        continueSlot={
          <Suspense fallback={null}>
            <ContinueLearning />
          </Suspense>
        }
      />
      <ExploreIndex groups={data.groups} symbols={data.symbols} animalCount={data.animalCount} />
      {data.comparison && <ManyHands comparison={data.comparison} />}
      <SignOff />
    </>
  );
}

/** Personalised: streams in at request time for signed-in readers. */
async function ContinueLearning() {
  const user = await getCurrentUser();
  if (!user) return null;
  const next = await getContinueLesson(getDb(), user.id);
  if (!next) return null;
  return (
    <Link href={`/learn/${next.blockSlug}/${next.lessonSlug}`} className="mt-2 block text-vermilion underline">
      {next.reason === "resume" ? "continue" : "next"}: {next.lessonTitle}
    </Link>
  );
}
