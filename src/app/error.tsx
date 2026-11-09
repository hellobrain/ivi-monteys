"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell pt-24">
      <h1 className="display text-[clamp(3rem,8vw,6rem)]">A page has torn</h1>
      <p className="mt-6 max-w-xl text-lg">Something went wrong while loading this page. It has been logged on the server.</p>
      <button onClick={reset} className="pill mt-8">
        Try again
      </button>
    </div>
  );
}
