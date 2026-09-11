import Image from "next/image";
import { cn } from "@/lib/utils";

const CROP = {
  aspectRatio: "1260 / 266",
  imageWidth: "175.08%",
  imageLeft: "-39.68%",
  imageTop: "-84.59%",
} as const;

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
      className={cn("relative block overflow-hidden bg-[#040f22]", className)}
      style={{ aspectRatio: CROP.aspectRatio }}
    >
      <Image
        src="/images/one-dream-group-logo-executive.png"
        alt={alt}
        width={2206}
        height={713}
        priority={priority}
        sizes="(max-width: 640px) 360px, 460px"
        draggable={false}
        className="pointer-events-none absolute h-auto max-w-none select-none"
        style={{
          left: CROP.imageLeft,
          top: CROP.imageTop,
          width: CROP.imageWidth,
        }}
      />
    </span>
  );
}

export function OneDreamGroupLoginLogo({ className }: Pick<OneDreamGroupLogoProps, "className">) {
  return (
    <Image
      src="/images/one-dream-group-logo-login.png"
      alt="One Dream Group — To Bring Togetherness"
      width={379}
      height={105}
      priority
      sizes="(max-width: 640px) 280px, 300px"
      draggable={false}
      className={cn("block h-auto", className)}
    />
  );
}
