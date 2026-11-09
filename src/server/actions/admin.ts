"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { PUBLICATION_STATUSES } from "@/domain/editorial";
import { requireRole } from "@/server/auth/dal";
import { getResource } from "@/server/admin/resources";
import { deleteRecord, saveRecord, transitionRecord, ValidationError } from "@/server/admin/service";
import { CONTENT_TAG } from "@/server/queries";

export type SaveState = { error?: string; fieldErrors?: Record<string, string>; ok?: string } | undefined;

/** Every action re-verifies the session and role on the server. */
async function editor() {
  return requireRole("editor");
}

function resourceOrThrow(key: unknown) {
  const r = getResource(z.string().parse(key));
  if (!r) throw new Error("Unknown resource");
  return r;
}

export async function saveRecordAction(_prev: SaveState, form: FormData): Promise<SaveState> {
  const user = await editor();
  const r = resourceOrThrow(form.get("_resource"));
  const idRaw = form.get("_id");
  const id = typeof idRaw === "string" && idRaw ? z.uuid().parse(idRaw) : null;
  let savedId: string;
  try {
    savedId = await saveRecord(getDb(), user, r, id, form);
  } catch (e) {
    if (e instanceof ValidationError) return { error: "Please correct the highlighted fields.", fieldErrors: e.fieldErrors };
    const msg = e instanceof Error ? e.message : "Save failed";
    // Surface database constraint messages (unique slug, check constraints) in plain words.
    if (/unique/i.test(msg)) return { error: "Another record already uses that slug or key." };
    if (/check constraint|violates/i.test(msg)) return { error: `The database rejected this combination of fields: ${msg.split("\n")[0]}` };
    return { error: msg };
  }
  updateTag(CONTENT_TAG);
  if (!id) redirect(`/admin/${r.key}/${savedId}?created=1`);
  return { ok: "Saved." };
}

export async function transitionAction(form: FormData) {
  const user = await editor();
  const r = resourceOrThrow(form.get("_resource"));
  const id = z.uuid().parse(form.get("_id"));
  const to = z.enum(PUBLICATION_STATUSES).parse(form.get("to"));
  await transitionRecord(getDb(), user, r, id, to);
  updateTag(CONTENT_TAG);
  redirect(`/admin/${r.key}/${id}`);
}

export async function deleteAction(form: FormData) {
  const user = await editor();
  const r = resourceOrThrow(form.get("_resource"));
  const id = z.uuid().parse(form.get("_id"));
  if (form.get("confirm") !== "delete") throw new Error("Type 'delete' to confirm");
  await deleteRecord(getDb(), user, r, id);
  updateTag(CONTENT_TAG);
  redirect(`/admin/${r.key}`);
}
