import { cn } from "@/lib/cn";
import type { Track } from "@/lib/tracks";

export function TrackIcon({
  track,
  size = "md",
  className,
}: {
  track: Track;
  size?: "sm" | "md";
  className?: string;
}) {
  const Icon = track.icon;
  const box = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const glyph = size === "sm" ? "w-[17px] h-[17px]" : "w-[18px] h-[18px]";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] bg-accent-soft text-accent flex items-center justify-center shrink-0",
        box,
        className
      )}
    >
      <Icon className={glyph} />
    </div>
  );
}
