import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export default async function CaptainLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("captain");
  return <AppShell session={session}>{children}</AppShell>;
}
