import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { readDemoDatabase } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MarketingPreferences } from "@/components/captain/marketing-preferences";

export default async function PreferencesPage() {
  const session = await requireRole("captain");
  let initial = false;
  if (isDemoMode) {
    const database = await readDemoDatabase();
    initial = (database.leads.find((item) => item.id === "demo-lead-2") ?? database.leads[0]).marketingConsent;
  } else {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("communication_preferences").select("marketing_enabled").eq("profile_id", session.userId).eq("channel", "email").maybeSingle();
    initial = Boolean(data?.marketing_enabled);
  }
  return <div className="mx-auto max-w-3xl"><p className="eyebrow text-[#8d672c]">Privacy & communication</p><h1 className="mt-2 text-4xl text-[#081326]">Preferences</h1><section className="mt-8 border bg-white p-7 sm:p-9"><h2 className="text-2xl text-[#081326]">Marketing permission</h2><p className="mt-3 text-sm leading-7 text-slate-600">Operational messages for an active enquiry or registration are separate from optional future-event marketing.</p><div className="mt-7 border-t pt-6"><MarketingPreferences initial={initial}/></div></section><section className="mt-5 border bg-white p-7"><h2 className="text-xl text-[#081326]">Data request</h2><p className="mt-3 text-sm leading-6 text-slate-600">To request access, correction or deletion, contact the operations team with your verified account email. Requests are reviewed before records are changed.</p><Link className="mt-4 inline-block text-sm font-bold text-[#313999]" href="/contact?request=data">Start a data request</Link></section></div>;
}
