import Image from "next/image";
import Link from "next/link";
import { hasAcceptedCurrentRules } from "@/lib/tournament-rules";
import QRCode from "qrcode";
import { CheckCircle2, Clock3, ExternalLink, IndianRupee, Phone, ScanLine, ShieldCheck, Smartphone } from "lucide-react";
import { SiGooglepay, SiPaytm, SiPhonepe } from "react-icons/si";
import { PaymentAction } from "@/components/captain/payment-action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth";
import { formatInr, TOURNAMENT, whatsappUrl } from "@/lib/constants";
import { upiPaymentConfig } from "@/lib/env";
import { getCaptainPaymentHistory } from "@/lib/payment-data";
import { getCaptainTeam } from "@/lib/teams";
import { buildUpiPaymentUri, formatPaymentStatus } from "@/lib/upi";

const acceptedApps = [
  { name: "Google Pay", icon: SiGooglepay },
  { name: "PhonePe", icon: SiPhonepe },
  { name: "Paytm", icon: SiPaytm },
  { name: "Any UPI app", icon: Smartphone },
] as const;

export default async function CaptainPaymentPage() {
  const session = await requireRole("captain");
  const team = await getCaptainTeam(session.userId);
  const payments = await getCaptainPaymentHistory(team.id);
  const paidPayment = payments.find((payment) => payment.status === "paid");
  const submittedPayment = payments.find((payment) => payment.status === "submitted");
  const currentStatus = paidPayment ? "paid" : submittedPayment ? "submitted" : "not_started";
  const currentRulesAccepted = hasAcceptedCurrentRules(team);
  const canStartPayment = currentStatus === "not_started" && currentRulesAccepted;
  const paymentReference = (team.enquiryReference ?? `ODC-${team.id}`).replace(/[^a-zA-Z0-9-]/g, "").slice(0, 35);
  const paymentUri = upiPaymentConfig.configured && canStartPayment
    ? buildUpiPaymentUri({
        upiId: upiPaymentConfig.upiId,
        payeeName: upiPaymentConfig.payeeName,
        amountPaise: TOURNAMENT.feePaise,
        transactionReference: paymentReference,
        note: `${team.name} registration`,
      })
    : "";
  const qrCode = paymentUri
    ? await QRCode.toDataURL(paymentUri, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 360,
        color: { dark: "#081326", light: "#ffffff" },
      })
    : "";
  const contactUrl = whatsappUrl(`Hello, I need help with the payment for ${team.name} (${paymentReference}).`);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow text-[#8d672c]">Registration step 5</p>
      <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl text-[#081326]">Team payment</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pay by any UPI app, then ask the organizer to confirm receipt.</p>
        </div>
        <Badge variant="outline">{formatPaymentStatus(currentStatus)}</Badge>
      </div>

      {!currentRulesAccepted && <Alert className="mt-6"><AlertTitle>Review the current tournament rules</AlertTitle><AlertDescription>Before starting a new payment, <Link href="/dashboard/rules" className="font-semibold underline">accept the current rules version</Link>. Previous payments remain recorded.</AlertDescription></Alert>}

      {upiPaymentConfig.demo ? (
        <Alert className="mt-6">
          <ShieldCheck />
          <AlertTitle>UPI preview details</AlertTitle>
          <AlertDescription>The QR, UPI ID, and phone below are safe demo values. No real payment can be made in this workspace.</AlertDescription>
        </Alert>
      ) : null}

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="[--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="text-2xl">Registration fee</CardTitle>
            <CardDescription>{team.name} · {team.company}</CardDescription>
            <CardAction><Badge variant="secondary">UPI</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-end gap-2">
              <IndianRupee aria-hidden="true" className="mb-1 size-6 text-muted-foreground" />
              <p className="font-heading text-5xl leading-none text-[#081326]">{formatInr(TOURNAMENT.feePaise).replace("₹", "")}</p>
              <p className="pb-1 text-sm text-muted-foreground">total</p>
            </div>

            {upiPaymentConfig.configured ? (
              <dl className="grid gap-4 rounded-lg bg-muted p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">UPI ID</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold break-all">{upiPaymentConfig.upiId}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Payee name</dt>
                  <dd className="mt-1 text-sm font-semibold">{upiPaymentConfig.payeeName}</dd>
                </div>
                {upiPaymentConfig.phone ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment phone</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm font-semibold"><Phone aria-hidden="true" className="size-4" />{upiPaymentConfig.phone}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment reference</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">{paymentReference}</dd>
                </div>
              </dl>
            ) : (
              <Alert>
                <AlertTitle>UPI details are being configured</AlertTitle>
                <AlertDescription>Contact the organizer before attempting payment.</AlertDescription>
              </Alert>
            )}

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Accepted in</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {acceptedApps.map(({ name, icon: Icon }) => (
                  <div key={name} className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg border bg-background px-2 text-center text-xs font-medium">
                    <Icon aria-hidden="true" className="size-6" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3 sm:flex-row">
            {paymentUri ? (
              <Button size="lg" nativeButton={false} render={<a href={paymentUri} />}>
                <Smartphone data-icon="inline-start" />
                Make payment
                <ExternalLink data-icon="inline-end" />
              </Button>
            ) : (
              <Button size="lg" disabled>
                {currentStatus === "paid" ? <CheckCircle2 data-icon="inline-start" /> : currentStatus === "submitted" ? <Clock3 data-icon="inline-start" /> : <Smartphone data-icon="inline-start" />}
                {currentStatus === "paid" ? "Payment completed" : currentStatus === "submitted" ? "Payment submitted" : "Make payment"}
              </Button>
            )}
            <p className="text-xs leading-5 text-muted-foreground">On mobile, this opens your installed UPI apps with the payee and amount prefilled.</p>
          </CardFooter>
        </Card>

        <Card className="[--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><ScanLine aria-hidden="true" className="size-6" />Scan to pay</CardTitle>
            <CardDescription>Scan with Google Pay, PhonePe, Paytm, or any UPI app.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            {qrCode ? (
              <div className="flex w-full max-w-[334px] flex-col items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
                <Image src={qrCode} alt={`UPI QR code for ${upiPaymentConfig.payeeName}`} width={300} height={300} unoptimized className="size-full max-w-[300px]" />
                <div className="w-full rounded-lg bg-[#f5f1e8] px-3 py-2.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8d672c]">UPI ID</p>
                  <p className="mt-1 break-all font-mono text-sm font-bold text-[#081326]">{upiPaymentConfig.upiId}</p>
                </div>
              </div>
            ) : currentStatus === "paid" ? (
              <div className="flex aspect-square w-full max-w-[300px] flex-col items-center justify-center gap-4 rounded-xl border bg-muted text-center">
                <CheckCircle2 aria-hidden="true" className="size-12 text-primary" />
                <div><p className="font-heading text-xl">Payment complete</p><p className="mt-2 text-sm text-muted-foreground">Receipt confirmed by the organizer.</p></div>
              </div>
            ) : currentStatus === "submitted" ? (
              <div className="flex aspect-square w-full max-w-[300px] flex-col items-center justify-center gap-4 rounded-xl border bg-muted text-center">
                <Clock3 aria-hidden="true" className="size-12 text-primary" />
                <div><p className="font-heading text-xl">Review pending</p><p className="mt-2 text-sm text-muted-foreground">No further payment is required while the organizer checks receipt.</p></div>
              </div>
            ) : (
              <div className="grid aspect-square w-full max-w-[300px] place-items-center rounded-xl border bg-muted text-center text-sm text-muted-foreground">QR unavailable</div>
            )}
            <p className="max-w-sm text-center text-xs leading-5 text-muted-foreground">Check the verified payee name and amount in your UPI app before entering your UPI PIN.</p>
          </CardContent>
          <CardFooter className="block">
            <PaymentAction status={currentStatus} enabled={upiPaymentConfig.configured && currentRulesAccepted} demo={session.demo} contactUrl={contactUrl} />
          </CardFooter>
        </Card>
      </section>

      <Card className="mt-7">
        <CardHeader>
          <CardTitle className="text-2xl">Your payment history</CardTitle>
          <CardDescription>Payment review requests and organizer confirmations for this team.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>UPI transaction ID</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                    <TableCell className="font-semibold">{formatInr(payment.amountPaise)}</TableCell>
                    <TableCell><Badge variant={payment.status === "paid" ? "default" : "secondary"}>{formatPaymentStatus(payment.status)}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{payment.transactionReference ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(payment.updatedAt).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-heading text-xl">No payment submitted yet</p>
              <p className="mt-2 text-sm text-muted-foreground">After paying by UPI, select “Payment done” to create a review request.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
