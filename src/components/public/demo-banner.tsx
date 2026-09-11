import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") return null;
  return (
    <div className="bg-[#d7aa54] px-4 py-2 text-center text-xs font-semibold tracking-wide text-[#081326]">
      <span className="inline-flex items-center gap-2">
        <FlaskConical aria-hidden="true" className="size-3.5" />
        DEMO MODE — sample records and non-payable payment reviews only
      </span>
    </div>
  );
}
