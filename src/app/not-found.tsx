import Link from "next/link";
import { Compass, House } from "@/icons";
import { Card } from "@/components/card";

export default function NotFound() {
  return (
    <div className="max-w-sm mx-auto px-4 pt-16 pb-8 min-h-dvh flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-accent-soft flex items-center justify-center mb-5">
        <Compass className="w-8 h-8 text-accent" />
      </div>
      <h1 className="text-[22px] font-semibold tracking-tight">Nothing here</h1>
      <p className="text-muted text-[14px] mt-2 leading-relaxed">
        This page doesn&apos;t exist, or the link may be out of date.
      </p>

      <Link href="/" className="w-full mt-7">
        <Card className="p-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <House className="w-4 h-4 text-accent" />
          <span className="text-[14px] font-medium">Back to Home</span>
        </Card>
      </Link>
    </div>
  );
}
