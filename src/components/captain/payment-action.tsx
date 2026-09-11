"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, MessageCircle, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function PaymentAction({
  status,
  enabled,
  demo,
  contactUrl,
}: {
  status: string;
  enabled: boolean;
  demo: boolean;
  contactUrl: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "paid") {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertTitle>Payment confirmed</AlertTitle>
        <AlertDescription>The organizer has confirmed receipt. Your team registration is complete.</AlertDescription>
      </Alert>
    );
  }

  if (status === "submitted") {
    return (
      <div className="flex flex-col gap-3">
        <Alert>
          <Clock3 />
          <AlertTitle>Waiting for organizer confirmation</AlertTitle>
          <AlertDescription>Your payment review request was sent. The team will be registered after the organizer confirms receipt.</AlertDescription>
        </Alert>
        <Button variant="outline" nativeButton={false} render={<a href={contactUrl} target="_blank" rel="noreferrer" />}>
          <MessageCircle data-icon="inline-start" />
          Contact organizer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button size="lg" disabled={!enabled} />}>
          <CheckCircle2 data-icon="inline-start" />
          Payment done
        </DialogTrigger>
        <DialogContent>
          <form
            className="contents"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError("");
              const formData = new FormData(event.currentTarget);
              const response = await fetch("/api/payments/manual-submit", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "idempotency-key": crypto.randomUUID(),
                },
                body: JSON.stringify({ transactionReference: formData.get("transactionReference") }),
              });
              const result = (await response.json().catch(() => ({}))) as { error?: string };
              setLoading(false);
              if (!response.ok) {
                setError(result.error ?? "The review request could not be sent.");
                return;
              }
              setOpen(false);
              router.refresh();
            }}
          >
            <DialogHeader>
              <DialogTitle>Send payment for review</DialogTitle>
              <DialogDescription>
                Confirm only after your UPI app shows a successful payment. The organizer will verify receipt before marking it paid.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="transactionReference">UPI transaction ID (optional)</FieldLabel>
                <Input
                  id="transactionReference"
                  name="transactionReference"
                  autoComplete="off"
                  maxLength={100}
                  placeholder="Example: 624512345678"
                  aria-invalid={Boolean(error)}
                />
                <FieldDescription>This helps the organizer match your payment more quickly.</FieldDescription>
                <FieldError>{error}</FieldError>
              </Field>
            </FieldGroup>
            {demo ? <p className="text-xs text-muted-foreground">Demo only: this records the review workflow without moving money.</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner data-icon="inline-start" /> : <Send data-icon="inline-start" />}
                {loading ? "Sending…" : "Send for review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Button variant="outline" nativeButton={false} render={<a href={contactUrl} target="_blank" rel="noreferrer" />}>
        <MessageCircle data-icon="inline-start" />
        Contact organizer
      </Button>
      {!enabled ? <p className="text-sm text-muted-foreground">Payment confirmation will be available after the organizer configures the UPI details.</p> : null}
    </div>
  );
}
