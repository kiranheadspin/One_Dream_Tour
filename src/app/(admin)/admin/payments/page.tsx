import { CircleDollarSign, Clock3, IndianRupee, ReceiptText } from "lucide-react";
import { AdminHeading } from "@/components/admin/admin-heading";
import { PaymentReviewAction } from "@/components/admin/payment-review-action";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminPayments } from "@/lib/admin-data";
import { formatInr } from "@/lib/constants";
import { formatPaymentStatus } from "@/lib/upi";

export default async function AdminPaymentsPage() {
  const payments = await listAdminPayments();
  const awaiting = payments.filter((payment) => payment.status === "submitted");
  const confirmed = payments.filter((payment) => payment.status === "paid");
  const receivedPaise = confirmed.reduce((total, payment) => total + payment.amountPaise, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminHeading
        eyebrow="Finance operations"
        title="Payments"
        description="Review captain payment requests and confirm only after the amount reaches the organizer account."
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader><CardDescription>Awaiting review</CardDescription><CardTitle className="text-3xl">{awaiting.length}</CardTitle></CardHeader>
          <CardContent><Clock3 aria-hidden="true" className="size-5 text-muted-foreground" /></CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardDescription>Confirmed payments</CardDescription><CardTitle className="text-3xl">{confirmed.length}</CardTitle></CardHeader>
          <CardContent><ReceiptText aria-hidden="true" className="size-5 text-muted-foreground" /></CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardDescription>Total received</CardDescription><CardTitle className="text-3xl">{formatInr(receivedPaise)}</CardTitle></CardHeader>
          <CardContent><IndianRupee aria-hidden="true" className="size-5 text-muted-foreground" /></CardContent>
        </Card>
      </section>

      <Card className="mt-7">
        <CardHeader>
          <CardTitle className="text-2xl">All payment requests</CardTitle>
          <CardDescription>Manual UPI submissions and future provider-backed payment records appear together.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment details</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-semibold">{payment.teamName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{payment.captainName}{payment.company ? ` · ${payment.company}` : ""}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatInr(payment.amountPaise)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : payment.status === "submitted" ? "secondary" : "outline"}>
                        {formatPaymentStatus(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{payment.providerPaymentId ?? "No transaction ID"}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{payment.orderId}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(payment.submittedAt ?? payment.updatedAt).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "submitted" ? (
                        <PaymentReviewAction paymentId={payment.id} teamName={payment.teamName} amount={formatInr(payment.amountPaise)} />
                      ) : payment.status === "paid" ? (
                        <span className="text-xs font-medium text-muted-foreground">Confirmed</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No action</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CircleDollarSign /></EmptyMedia>
                <EmptyTitle>No payment requests yet</EmptyTitle>
                <EmptyDescription>When a captain selects “Payment done,” the request will appear here for organizer review.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
