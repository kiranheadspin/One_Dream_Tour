import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "captain";
export interface AppSession { userId: string; name: string; loginIdentifier: string; role: AppRole; demo: boolean; }

export async function getSession(): Promise<AppSession | null> {
  if (isDemoMode) {
    const role = (await cookies()).get("odc_demo_session")?.value as AppRole | undefined;
    if (!role || !["admin", "captain"].includes(role)) return null;
    return role === "admin"
      ? { userId: "demo-admin", name: "Operations Admin", loginIdentifier: "admin@demo.local", role, demo: true }
      : { userId: "demo-captain", name: "Meera Nair", loginIdentifier: "meera.captain", role, demo: true };
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: roleRows }, { data: profile }] = await Promise.all([
    supabase.from("profile_roles").select("role").eq("profile_id", user.id).in("role", ["admin", "captain"]),
    supabase.from("profiles").select("full_name,username").eq("id", user.id).maybeSingle(),
  ]);
  const roles = new Set((roleRows ?? []).map((row) => row.role as AppRole));
  const role: AppRole | null = roles.has("admin") ? "admin" : roles.has("captain") ? "captain" : null;
  if (!role) return null;
  return { userId: user.id, name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? "User", loginIdentifier: role === "captain" ? profile?.username ?? "Captain" : user.email ?? "Administrator", role, demo: false };
}

export async function requireRole(role: AppRole) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/${role === "admin" ? "admin" : "dashboard"}`);
  if (session.role !== role) redirect(session.role === "admin" ? "/admin" : "/dashboard");
  return session;
}
