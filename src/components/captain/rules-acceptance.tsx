"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function RulesAcceptance({ acceptedAt }: { acceptedAt?: string }) {
  const router=useRouter(); const [checked,setChecked]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  if(acceptedAt) return <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Rules version 2026-draft accepted on {new Date(acceptedAt).toLocaleString("en-IN")}.</div>;
  async function accept(){setLoading(true); const response=await fetch("/api/captain/rules",{method:"POST"}); setLoading(false); if(!response.ok){setError("Acceptance could not be recorded.");return;} router.refresh();}
  return <div className="grid gap-4"><label className="flex items-start gap-3 text-sm leading-6"><Checkbox checked={checked} onCheckedChange={(value)=>setChecked(value===true)} className="mt-1"/>I have reviewed this displayed rules version and understand that exact operational rules will be confirmed before payment.</label><Button className="h-10 w-fit bg-[#313999] text-white" disabled={!checked||loading} onClick={accept}>{loading?"Recording…":"Record acceptance"}</Button>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}
