import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/account/auth-forms";
import { PageHeader } from "@/components/ui/page-header";
import { safeRedirectPath } from "@/lib/safe-url";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage({ searchParams }: PageProps<"/account/sign-in">) {
  return (
    <>
      <PageHeader eyebrow="Account" title="Sign in" intro="Keep your progress, bookmarks and research notes." />
      <div className="page-shell mt-10">
        <Suspense fallback={<SignInForm />}>
          <WithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function WithNext({ searchParams }: Pick<PageProps<"/account/sign-in">, "searchParams">) {
  const n = (await searchParams).next;
  return <SignInForm next={safeRedirectPath(Array.isArray(n) ? n[0] : n)} />;
}
