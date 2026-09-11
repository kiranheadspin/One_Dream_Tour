"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STAGES, type LeadStage } from "@/lib/constants";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export function LeadStageSelect({ id, stage }: { id: string; stage: LeadStage }) {
  const router=useRouter(); const [value,setValue]=useState(stage); const [saving,setSaving]=useState(false);
  async function change(next:LeadStage){setValue(next);setSaving(true);const response=await fetch(`/api/admin/leads/${encodeURIComponent(id)}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({stage:next})});setSaving(false);if(!response.ok)setValue(stage);else router.refresh();}
  return <NativeSelect size="sm" disabled={saving} value={value} onChange={(event)=>change(event.target.value as LeadStage)} className="w-[160px]">{LEAD_STAGES.map(item=><NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}</NativeSelect>;
}
