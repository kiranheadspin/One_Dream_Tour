"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export function AddPlayerDialog() {
  const router = useRouter(); const [open,setOpen]=useState(false); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/captain/players", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(values) });
    const result = await response.json() as { error?: string };
    setLoading(false); if(!response.ok){ setError(result.error ?? "Player could not be added."); return; }
    setOpen(false); router.refresh();
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button className="h-10 bg-[#313999] text-white" />}><Plus data-icon="inline-start"/>Add player</DialogTrigger><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle className="text-2xl text-[#081326]">Add a player</DialogTitle><DialogDescription>Use company-verified details. The captain can edit only this team.</DialogDescription></DialogHeader><form onSubmit={submit}><FieldGroup className="grid gap-4 py-3 sm:grid-cols-2"><Field className="sm:col-span-2"><FieldLabel htmlFor="player-name">Full name</FieldLabel><Input id="player-name" name="name" required className="h-10"/></Field><Field><FieldLabel htmlFor="player-email">Work email</FieldLabel><Input id="player-email" name="email" type="email" required className="h-10"/></Field><Field><FieldLabel htmlFor="player-phone">Phone</FieldLabel><Input id="player-phone" name="phone" type="tel" required className="h-10"/></Field><Field><FieldLabel htmlFor="employee-id">Employee ID</FieldLabel><Input id="employee-id" name="employeeId" required className="h-10"/></Field><Field><FieldLabel htmlFor="shirt-size">Shirt size</FieldLabel><NativeSelect id="shirt-size" name="shirtSize" className="w-full"><NativeSelectOption value="M">M</NativeSelectOption>{["XS","S","L","XL","XXL"].map(size=><NativeSelectOption value={size} key={size}>{size}</NativeSelectOption>)}</NativeSelect></Field>{error&&<FieldError className="sm:col-span-2">{error}</FieldError>}</FieldGroup><DialogFooter><Button type="submit" className="bg-[#313999] text-white" disabled={loading}>{loading?"Adding…":"Add player"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
