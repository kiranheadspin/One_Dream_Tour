"use client";

import { useState } from "react";
import { RULES_SUMMARY } from "@/lib/tournament-rules";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Player } from "@/lib/types";

export function PlayerActions({ player }: { player: Player }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function update(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch(`/api/captain/players/${player.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(result.error ?? "Player could not be updated."); return; }
      setOpen(false);
      router.refresh();
    } catch { setError("Player could not be updated. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  async function remove() {
    if (!window.confirm(`Remove ${player.name} from this team? This cannot be undone.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/captain/players/${player.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(result.error ?? "Player could not be removed."); return; }
      router.refresh();
    } catch { setError("Player could not be removed. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  if (player.isCaptain) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label={`Actions for ${player.name}`}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" disabled={loading} />}>
          <Pencil data-icon="inline-start" /> Edit
        </DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl text-[#081326]">Edit player</DialogTitle><DialogDescription>Update the player details for {player.name}.</DialogDescription></DialogHeader>
          <form key={`${player.id}-${player.name}-${player.email}-${player.phone}-${player.employeeId}-${player.epfoNumber}`} onSubmit={update}>
            <FieldGroup className="grid gap-4 py-3 sm:grid-cols-2">
              <Field className="sm:col-span-2"><FieldLabel htmlFor={`player-${player.id}-name`}>Full name</FieldLabel><Input id={`player-${player.id}-name`} name="name" required autoComplete="name" defaultValue={player.name} className="h-11" /></Field>
              <Field><FieldLabel htmlFor={`player-${player.id}-email`}>Work email</FieldLabel><Input id={`player-${player.id}-email`} name="email" type="email" required autoComplete="email" defaultValue={player.email} className="h-11" /></Field>
              <Field><FieldLabel htmlFor={`player-${player.id}-phone`}>Phone</FieldLabel><Input id={`player-${player.id}-phone`} name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={player.phone} className="h-11" /></Field>
              <Field><FieldLabel htmlFor={`player-${player.id}-employee-id`}>Employee ID</FieldLabel><Input id={`player-${player.id}-employee-id`} name="employeeId" required defaultValue={player.employeeId} className="h-11" /></Field>
              <Field><FieldLabel htmlFor={`player-${player.id}-epfo-number`}>EPFO number (optional)</FieldLabel><Input id={`player-${player.id}-epfo-number`} name="epfoNumber" defaultValue={player.epfoNumber} className="h-11" /><FieldDescription>{RULES_SUMMARY.pfEntry}</FieldDescription></Field>
              {error ? <FieldError className="sm:col-span-2" role="alert">{error}</FieldError> : null}
            </FieldGroup>
            <DialogFooter><Button type="submit" className="h-11 w-full bg-[#313999] text-white sm:w-auto" disabled={loading}>{loading ? "Saving…" : "Save changes"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" disabled={loading} onClick={remove}><Trash2 data-icon="inline-start" /> {loading ? "Removing…" : "Remove"}</Button>
      {error ? <p className="basis-full text-sm text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}
