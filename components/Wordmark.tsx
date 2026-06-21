export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-navy ${className}`}
    >
      <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald" aria-hidden />
      outlay
    </span>
  );
}
