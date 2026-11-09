"use client";

import { useActionState } from "react";
import { createNoteAction, type FormState } from "@/server/actions/account";

export function NoteForm({ entityType, entitySlug, href, defaultTitle }: { entityType?: string; entitySlug?: string; href?: string; defaultTitle?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createNoteAction, undefined);
  return (
    <form action={action} className="mt-4 space-y-3">
      {entityType && <input type="hidden" name="entityType" value={entityType} />}
      {entitySlug && <input type="hidden" name="entitySlug" value={entitySlug} />}
      {href && <input type="hidden" name="href" value={href} />}
      <label className="block">
        <span className="label">Title</span>
        <input className="input mt-1" name="title" defaultValue={defaultTitle} required maxLength={200} />
      </label>
      <label className="block">
        <span className="label">Observation</span>
        <textarea className="input mt-1 min-h-32" name="body" required maxLength={20000} />
      </label>
      <button className="pill" disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </button>
      <p aria-live="polite" className="label">
        {state?.error && <span className="text-vermilion">{state.error}</span>}
        {state?.ok}
      </p>
    </form>
  );
}
