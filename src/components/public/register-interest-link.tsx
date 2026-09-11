import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type RegisterInterestLinkProps = {
  className?: string;
};

export function RegisterInterestLink({ className }: RegisterInterestLinkProps) {
  return (
    <Link
      href="/register"
      data-testid="page-register-interest"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d7aa54] px-7 text-sm font-bold text-[#081326] transition-colors hover:bg-[#e3bb6c]",
        className,
      )}
    >
      Register interest
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}
