import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  return <AppShell session={session}>{children}</AppShell>;
}
