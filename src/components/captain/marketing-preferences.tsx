"use client";

import { useState } from "react";
import { analytics } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function MarketingPreferences({ initial }: { initial: boolean }) {
  const [enabled,setEnabled]=useState(initial);const [saved,setSaved]=useState("");const [loading,setLoading]=useState(false);
  async function save(){setLoading(true);setSaved("");const response=await fetch("/api/preferences/marketing",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({granted:enabled})});setLoading(false);setSaved(response.ok?"Preference saved.":"Preference could not be saved.");if(response.ok)analytics.track(enabled?"marketing_consent_accepted":"marketing_consent_withdrawn");}
  return <div className="grid gap-5"><label className="flex items-start gap-3 text-sm leading-6"><Checkbox checked={enabled} onCheckedChange={(value)=>setEnabled(value===true)} className="mt-1"/><span><b className="block text-[#081326]">Future event updates</b>I would like to receive information about future One Dream tournaments, corporate sporting events and offers through WhatsApp and email.</span></label><Button onClick={save} disabled={loading} className="w-fit bg-[#313999] text-white">{loading?"Saving…":"Save preference"}</Button>{saved&&<p aria-live="polite" className="text-sm text-slate-600">{saved}</p>}<p className="text-xs leading-5 text-slate-500">Marketing is optional. Withdrawing it does not affect operational messages for an active registration.</p></div>;
}
