import { cn } from "@/lib/cn";
import { Card } from "@/components/card";

export function Bone({ className }: { className?: string }) {
  return <div className={cn("skeleton-bone rounded-[var(--radius-sm)]", className)} />;
}

function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8", className)}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {children}
      <span className="sr-only">Loading</span>
    </div>
  );
}

function RowCardBone({ lines = 2 }: { lines?: 2 | 3 }) {
  return (
    <Card className="p-3.5 flex items-center gap-3.5">
      <Bone className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0" />
      <div className="min-w-0 flex-1">
        <Bone className="h-3.5 w-28" />
        <Bone className="h-3 w-full max-w-[12rem] mt-2" />
        {lines === 3 ? <Bone className="h-1 w-full max-w-[10rem] mt-2.5 rounded-full" /> : null}
      </div>
    </Card>
  );
}

export function HomeSkeleton() {
  return (
    <PageShell className="max-w-5xl px-4 md:px-10 pt-3 md:pt-12">
      <div className="hidden md:flex items-center justify-between gap-4 mb-6">
        <Bone className="h-5 w-16" />
        <Bone className="h-7 w-20 rounded-full" />
      </div>

      <Bone className="h-[180px] md:h-[168px] rounded-[var(--radius-lg)]" />

      <div className="mt-8 md:mt-10">
        <div className="hidden md:flex items-end justify-between mb-5 px-0.5">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-14" />
        </div>
        <div className="-mx-4 md:mx-0 px-4 md:px-0 flex md:grid md:grid-cols-2 gap-5 overflow-hidden md:overflow-visible">
          <Card className="p-5 min-h-[200px] flex-[0_0_calc(100%-2.75rem)] md:flex-none">
            <Bone className="h-3 w-16" />
            <Bone className="h-6 w-40 mt-3" />
            <Bone className="h-3 w-full max-w-xs mt-3" />
            <Bone className="h-3 w-24 mt-8" />
          </Card>
          <Card className="p-5 min-h-[200px] flex-[0_0_calc(100%-2.75rem)] md:flex-none" aria-hidden>
            <Bone className="h-3 w-16" />
            <Bone className="h-6 w-36 mt-3" />
            <Bone className="h-3 w-full max-w-xs mt-3" />
            <Bone className="h-3 w-24 mt-8" />
          </Card>
        </div>
        <div className="mt-2.5 flex md:hidden items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Bone className="h-1.5 w-5 rounded-full" />
            <Bone className="h-1.5 w-1.5 rounded-full" />
            <Bone className="h-1.5 w-1.5 rounded-full" />
          </div>
          <Bone className="h-3 w-14" />
        </div>
      </div>

      <div className="mt-4 md:mt-8 flex flex-col gap-2.5">
        <RowCardBone />
        <RowCardBone />
        <RowCardBone lines={3} />
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3 mb-2.5 px-0.5">
          <Bone className="h-4 w-24" />
          <Bone className="h-3 w-14" />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-2.5 card-shadow">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-background/70 border border-border/70 px-3 py-2.5"
              >
                <Bone className="w-8 h-8 rounded-full shrink-0" />
                <Bone className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function TracksSkeleton() {
  return (
    <PageShell className="max-w-2xl">
      <Bone className="h-7 w-44" />
      <Bone className="h-4 w-full max-w-sm mt-3" />
      <Card className="p-5 mt-6">
        <Bone className="h-3 w-20" />
        <div className="flex gap-3 mt-3">
          <Bone className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0" />
          <div className="flex-1">
            <Bone className="h-4 w-40" />
            <Bone className="h-3 w-full mt-2" />
          </div>
        </div>
      </Card>
      <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0" />
            <div className="flex-1">
              <Bone className="h-4 w-36" />
              <Bone className="h-3 w-48 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function SandboxSkeleton() {
  return (
    <PageShell className="max-w-3xl flex flex-col h-[calc(100dvh-8rem)]">
      <div className="flex items-center justify-between">
        <Bone className="h-8 w-28 rounded-[var(--radius-pill)]" />
        <Bone className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex-1 mt-8 flex flex-col gap-4">
        <Bone className="h-16 w-[70%] rounded-[var(--radius-lg)] self-end" />
        <Bone className="h-24 w-[80%] rounded-[var(--radius-lg)]" />
        <Bone className="h-12 w-[55%] rounded-[var(--radius-lg)] self-end" />
      </div>
      <Bone className="h-14 w-full rounded-[var(--radius-lg)] mt-4" />
    </PageShell>
  );
}

export function ListPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <PageShell className="max-w-3xl">
      <Bone className="h-7 w-36" />
      <Bone className="h-4 w-52 mt-3" />
      <div className="mt-6 flex flex-col gap-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i} className="p-4 flex items-center gap-3.5">
            <Bone className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0" />
            <Bone className="h-4 flex-1" />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function ToolsSkeleton() {
  return (
    <PageShell className="max-w-md px-4 md:px-8 pt-3 md:pt-10">
      <Bone className="h-7 w-24" />
      <Bone className="h-4 w-full max-w-xs mt-3" />
      <Card className="mt-5 overflow-hidden p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border last:border-b-0"
          >
            <Bone className="w-10 h-10 rounded-full shrink-0" />
            <div className="min-w-0 flex-1">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-full max-w-[14rem] mt-2" />
            </div>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}

export function LanguageSkeleton() {
  return (
    <div
      className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <Bone className="h-3.5 w-16" />
      <Bone className="h-7 w-32 mt-4" />
      <Bone className="h-4 w-full max-w-xs mt-3" />
      <Bone className="h-11 w-full mt-5 rounded-[var(--radius-pill)]" />
      <Card className="mt-4 overflow-hidden p-0">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Bone className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0" />
          <div className="min-w-0 flex-1">
            <Bone className="h-4 w-40" />
            <Bone className="h-3 w-28 mt-2" />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-b-0"
          >
            <Bone className="w-8 h-8 rounded-full shrink-0" />
            <div className="min-w-0 flex-1">
              <Bone className="h-4 w-24" />
              <Bone className="h-3 w-20 mt-2" />
            </div>
          </div>
        ))}
      </Card>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div
      className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex justify-end">
        <Bone className="w-10 h-10 rounded-full" />
      </div>
      <div className="mt-8 flex flex-col items-center">
        <Bone className="w-[5.5rem] h-[5.5rem] rounded-full" />
        <Bone className="h-7 w-36 mt-4" />
        <Bone className="h-3.5 w-44 mt-2" />
        <Bone className="h-10 w-32 rounded-full mt-5" />
      </div>
      <div className="grid grid-cols-3 gap-2.5 mt-8">
        <Bone className="h-[5.5rem] rounded-[var(--radius-lg)]" />
        <Bone className="h-[5.5rem] rounded-[var(--radius-lg)]" />
        <Bone className="h-[5.5rem] rounded-[var(--radius-lg)]" />
      </div>
      <Bone className="h-20 rounded-[var(--radius-lg)] mt-3" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
