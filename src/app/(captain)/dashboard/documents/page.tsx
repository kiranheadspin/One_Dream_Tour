import Link from "next/link";
import { FileLock2 } from "lucide-react";
import { RULES_SUMMARY } from "@/lib/tournament-rules";

export default function DocumentsPage() {
  return <div className="mx-auto max-w-4xl">
    <p className="eyebrow text-[#8d672c]">Registration documents</p>
    <h1 className="mt-2 text-4xl text-[#081326]">Employment verification</h1>
    <section className="mt-8 border bg-white p-8">
      <FileLock2 aria-hidden="true" className="size-8 text-[#313999]" />
      <h2 className="mt-5 text-2xl text-[#081326]">Evidence required by the S50 rules</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{RULES_SUMMARY.evidence}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{RULES_SUMMARY.pfEntry}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">Online document upload is not available. Contact the organiser for the verification process and approved submission method. Entering roster details or completing payment does not confirm player eligibility.</p>
      <Link href="/contact" className="mt-5 inline-block text-sm font-semibold text-[#313999] underline">Contact the organiser</Link>
    </section>
  </div>;
}
