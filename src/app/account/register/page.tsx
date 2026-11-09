import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/auth-forms";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Join" intro="An account is free and optional. It stores your progress, bookmarks and notes; nothing else." />
      <div className="page-shell mt-10">
        <RegisterForm />
      </div>
    </>
  );
}
