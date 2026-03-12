import { cookies } from "next/headers";
import { verifySessionToken } from "./auth-core";

export * from "./auth-core";

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
