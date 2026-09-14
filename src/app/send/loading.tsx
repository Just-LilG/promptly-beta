export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-10 animate-pulse">
      <div className="h-9 w-32 rounded-full bg-surface-raised mb-6" />
      <div className="h-56 rounded-[var(--radius-lg)] bg-surface-raised" />
    </div>
  );
}
