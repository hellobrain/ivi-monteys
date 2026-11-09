"use client";

import { useActionState } from "react";
import { saveRecordAction, type SaveState } from "@/server/actions/admin";
import type { FieldDef } from "@/server/admin/resources";
import { MarkdownEditor } from "./markdown-editor";

export interface FormRelation {
  name: string;
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
}

export function RecordForm({
  resource,
  id,
  fields,
  values,
  refOptions,
  relations,
}: {
  resource: string;
  id: string | null;
  fields: FieldDef[];
  values: Record<string, unknown>;
  refOptions: Record<string, { id: string; label: string }[]>;
  relations: FormRelation[];
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveRecordAction, undefined);
  const err = (n: string) => state?.fieldErrors?.[n];

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="_resource" value={resource} />
      {id && <input type="hidden" name="_id" value={id} />}
      {state?.error && (
        <p role="alert" className="border border-vermilion p-3 label text-vermilion">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="border border-moss p-3 label text-moss">
          {state.ok}
        </p>
      )}

      {fields.map((f) => {
        const fid = `f-${f.name}`;
        const v = values[f.name];
        const common = { id: fid, name: f.name, "aria-invalid": !!err(f.name), "aria-describedby": f.help ? `${fid}-help` : undefined };
        let control: React.ReactNode;
        switch (f.type) {
          case "markdown":
            control = <MarkdownEditor id={fid} name={f.name} defaultValue={(v as string) ?? ""} invalid={!!err(f.name)} />;
            break;
          case "textarea":
            control = <textarea {...common} defaultValue={(v as string) ?? ""} className="input min-h-28" required={f.required} />;
            break;
          case "tags":
            control = <textarea {...common} defaultValue={Array.isArray(v) ? v.join("\n") : ""} className="input min-h-28" />;
            break;
          case "boolean":
            control = <input {...common} type="checkbox" defaultChecked={!!v} className="h-5 w-5" />;
            break;
          case "select":
            control = (
              <select {...common} defaultValue={(v as string) ?? ""} className="input bg-ink" required={f.required}>
                {!f.required && <option value="">—</option>}
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            );
            break;
          case "ref":
            control = (
              <select {...common} defaultValue={(v as string) ?? ""} className="input bg-ink" required={f.required}>
                <option value="">—</option>
                {(refOptions[f.ref!] ?? []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
            break;
          default:
            control = (
              <input
                {...common}
                type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                step={f.type === "number" ? "any" : undefined}
                defaultValue={v === null || v === undefined ? "" : String(v)}
                className="input"
                required={f.required}
              />
            );
        }
        return (
          <div key={f.name} className={f.type === "boolean" ? "flex items-center gap-3" : ""}>
            <label htmlFor={fid} className="label block">
              {f.label}
              {f.required && <span className="text-vermilion"> *</span>}
            </label>
            <div className={f.type === "boolean" ? "order-first" : "mt-1"}>{control}</div>
            {f.help && (
              <p id={`${fid}-help`} className="label mt-1 text-sm text-muted">
                {f.help}
              </p>
            )}
            {err(f.name) && <p className="label mt-1 text-vermilion">{err(f.name)}</p>}
          </div>
        );
      })}

      {relations.map((rel) => (
        <fieldset key={rel.name} className="border border-rule p-4">
          <legend className="label px-1">{rel.label}</legend>
          <div className="mt-2 grid max-h-64 gap-1 overflow-auto sm:grid-cols-2">
            {rel.options.map((o) => (
              <label key={o.id} className="label flex items-center gap-2">
                <input type="checkbox" name={`rel:${rel.name}`} value={o.id} defaultChecked={rel.selected.includes(o.id)} />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button className="pill pill-solid" disabled={pending}>
        {pending ? "Saving…" : id ? "Save changes" : "Create draft"}
      </button>
    </form>
  );
}
