export default function Wordmark({
  className = "",
  tone = "navy",
}: {
  className?: string;
  tone?: "navy" | "paper";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-lg font-semibold tracking-tight ${
        tone === "paper" ? "text-paper" : "text-navy"
      } ${className}`}
    >
      <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald" aria-hidden />
      outlay
    </span>
  );
}
