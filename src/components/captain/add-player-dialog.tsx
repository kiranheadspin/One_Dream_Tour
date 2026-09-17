"use client";

import { useState } from "react";
import { RULES_SUMMARY } from "@/lib/tournament-rules";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AddPlayerDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError("");

    try {
      const values = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/captain/players", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Player could not be added.");
        return;
      }

      form.reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Player could not be added. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-11 w-full bg-[#313999] text-white sm:w-auto" />}>
        <Plus data-icon="inline-start" />
        Add player
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#081326]">Add a player</DialogTitle>
          <DialogDescription>Use company-verified details for this team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <FieldGroup className="grid gap-4 py-3 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="player-name">Full name</FieldLabel>
              <Input id="player-name" name="name" required autoComplete="name" className="h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="player-email">Work email</FieldLabel>
              <Input id="player-email" name="email" type="email" required autoComplete="email" className="h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="player-phone">Phone</FieldLabel>
              <Input id="player-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" className="h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="employee-id">Employee ID</FieldLabel>
              <Input id="employee-id" name="employeeId" required className="h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="epfo-number">EPFO number (optional)</FieldLabel>
              <Input id="epfo-number" name="epfoNumber" className="h-11" />
              <FieldDescription>{RULES_SUMMARY.pfEntry}</FieldDescription>
            </Field>
            {error ? <FieldError className="sm:col-span-2" role="alert">{error}</FieldError> : null}
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" className="h-11 w-full bg-[#313999] text-white sm:w-auto" disabled={loading}>
              {loading ? "Adding…" : "Add player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
