"use client";

import { useActionState } from "react";
import { submitExerciseAction, type ExerciseResult } from "@/server/actions/account";

type Exercise = { id: string; title: string; instructions: string | null; questions: { id: string; prompt: string; answers: { id: string; text: string }[] }[] };

export function ExerciseForm({ exercise }: { exercise: Exercise }) {
  const [result, action, pending] = useActionState<ExerciseResult | undefined, FormData>(submitExerciseAction, undefined);
  const byQ = new Map(result?.results.map((r) => [r.questionId, r]));
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="exerciseId" value={exercise.id} />
      {exercise.instructions && <p className="label text-muted">{exercise.instructions}</p>}
      {exercise.questions.map((q, i) => {
        const r = byQ.get(q.id);
        return (
          <fieldset key={q.id} className="border-t border-rule pt-5">
            <legend className="font-serif text-lg">
              <span className="label mr-2 text-muted">{i + 1}.</span>
              {q.prompt}
            </legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {q.answers.map((a) => {
                const isRight = r && r.correctAnswerId === a.id;
                const isWrongPick = r && r.chosen === a.id && !r.isCorrect;
                return (
                  <label
                    key={a.id}
                    className={`label flex cursor-pointer items-center gap-2 border px-3 py-2 has-[:checked]:border-paper ${
                      isRight ? "border-moss text-moss" : isWrongPick ? "border-vermilion text-vermilion" : "border-rule"
                    }`}
                  >
                    <input type="radio" name={`q:${q.id}`} value={a.id} required className="accent-[var(--color-vermilion)]" />
                    {a.text}
                  </label>
                );
              })}
            </div>
            {r && (
              <p className="label mt-3" aria-live="polite">
                <strong className={`font-normal uppercase ${r.isCorrect ? "text-moss" : "text-vermilion"}`}>{r.isCorrect ? "Right." : "Not quite."}</strong>{" "}
                {r.explanation}
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="flex items-center gap-6">
        <button className="pill pill-solid" disabled={pending}>
          {pending ? "Checking…" : "Check answers"}
        </button>
        {result && (
          <p className="label" aria-live="polite">
            {result.score} of {result.total} correct{result.saved ? " · saved to your progress" : ""}
          </p>
        )}
      </div>
    </form>
  );
}
