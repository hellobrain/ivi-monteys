"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, signIn, type FormState } from "@/server/actions/account";

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);
  return (
    <form action={action} className="max-w-md space-y-4">
      <input type="hidden" name="next" value={next ?? "/account"} />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      {state?.error && (
        <p role="alert" className="label text-vermilion">
          {state.error}
        </p>
      )}
      <button className="pill pill-solid" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="label text-muted">
        New here?{" "}
        <Link href="/account/register" className="underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, undefined);
  return (
    <form action={action} className="max-w-md space-y-4">
      <Field label="Name" name="displayName" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password (at least 10 characters)" name="password" type="password" autoComplete="new-password" minLength={10} />
      {state?.error && (
        <p role="alert" className="label text-vermilion">
          {state.error}
        </p>
      )}
      <button className="pill pill-solid" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input mt-1" required {...props} />
    </label>
  );
}
