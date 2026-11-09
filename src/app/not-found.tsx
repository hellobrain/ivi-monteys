import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell pt-24">
      <p className="label text-muted">404</p>
      <h1 className="display mt-4 text-[clamp(4rem,12vw,10rem)]">Not in this book</h1>
      <p className="mt-6 max-w-xl text-lg">The page you were looking for does not exist, or has not been published yet.</p>
      <Link href="/animals" className="pill mt-8">
        Open the bestiary
      </Link>
    </div>
  );
}
