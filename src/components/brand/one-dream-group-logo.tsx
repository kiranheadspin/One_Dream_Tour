import Image from "next/image";
import { cn } from "@/lib/utils";

type OneDreamGroupLogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function OneDreamGroupLogo({
  alt = "One Dream Group — To Bring Togetherness",
  className,
  priority = false,
}: OneDreamGroupLogoProps) {
  return (
    <span
      className={cn("relative block", className)}
      style={{ aspectRatio: "1260 / 266" }}
    >
      <Image
        src="/images/one-dream-mark.png"
        alt={alt}
        width={512}
        height={512}
        priority={priority}
        sizes="(max-width: 640px) 72px, 96px"
        draggable={false}
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-auto select-none"
      />
    </span>
  );
}

export function OneDreamGroupLoginLogo({ className }: Pick<OneDreamGroupLogoProps, "className">) {
  return (
    <span className={cn("relative block w-[300px]", className)} style={{ aspectRatio: "379 / 105" }}>
      <Image
        src="/images/one-dream-mark.png"
        alt="One Dream Group"
        width={512}
        height={512}
        priority
        sizes="(max-width: 640px) 72px, 96px"
        draggable={false}
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-auto select-none"
      />
    </span>
  );
}
