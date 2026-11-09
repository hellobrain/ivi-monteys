import "server-only";
import { redirect } from "next/navigation";
import { hasRole, type Role } from "@/domain/editorial";
import { getCurrentUser, type SessionUser } from "./session";

/** For pages: redirect anonymous users to sign in. */
export async function requireUser(next = "/account"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

/** For admin pages and every admin Server Action. Checked on the server, every time. */
export async function requireRole(role: Role, next = "/admin"): Promise<SessionUser> {
  const user = await requireUser(next);
  if (!hasRole(user.role, role)) redirect("/account?error=forbidden");
  return user;
}
