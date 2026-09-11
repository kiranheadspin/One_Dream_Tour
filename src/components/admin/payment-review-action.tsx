"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export function PaymentReviewAction({ paymentId, teamName, amount }: { paymentId: string; teamName: string; amount: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirmPayment() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/payments/${paymentId}/confirm`, { method: "POST" });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Payment could not be confirmed.");
      return;
    }
    setOpen(false);
    toast.success("Payment receipt confirmed.");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <CheckCircle2 data-icon="inline-start" />
        Review
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm payment received?</DialogTitle>
          <DialogDescription>
            Confirm that {amount} from {teamName} is visible in the organizer&apos;s account. This will register the team as paid.
          </DialogDescription>
        </DialogHeader>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={confirmPayment} disabled={loading}>
            {loading ? <Spinner data-icon="inline-start" /> : <CheckCircle2 data-icon="inline-start" />}
            {loading ? "Confirming…" : "Confirm received"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
