"use client";

import { useActionState } from "react";
import { savePreferencesAction, type FormState } from "@/server/actions/account";

export function PreferencesForm({ prefs }: { prefs: { showProvisional: boolean; reduceMotion: boolean; readingSize: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePreferencesAction, undefined);
  return (
    <form action={action} className="mt-4 max-w-md space-y-3 label text-[1.0625rem]">
      <label className="flex items-center gap-3">
        <input type="checkbox" name="showProvisional" defaultChecked={prefs.showProvisional} /> Show provisional entries
      </label>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="reduceMotion" defaultChecked={prefs.reduceMotion} /> Reduce motion
      </label>
      <label className="block">
        Reading size
        <select name="readingSize" defaultValue={prefs.readingSize} className="input mt-1 bg-ink">
          <option value="standard">Standard</option>
          <option value="large">Large</option>
        </select>
      </label>
      <button className="pill" disabled={pending}>
        Save preferences
      </button>
      <p aria-live="polite">{state?.ok}</p>
    </form>
  );
}
