import { cn } from "@/lib/cn";

const MARK = "/brand/promptly-mark.svg";

export function BrandMark({
  size = 32,
  className,
  alt = "",
}: {
  size?: number;
  className?: string;
  alt?: string;
}) {
  // SVG stays sharp at any size. The old PNG had the chat hole painted black,
  // which showed up as a dirty rim on cream and mint cards.
  return (
    <span
      className={cn("inline-flex shrink-0 bg-transparent", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={MARK}
        alt={alt}
        width={size}
        height={size}
        draggable={false}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
