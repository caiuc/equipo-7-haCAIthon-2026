export function StatusBadge({
  status,
}: {
  status: "NORMAL" | "WARNING" | "CRITICAL" | "PENDING" | "IN_TRANSIT" | "COMPLETED" | "SEARCHING" | "COVERED" | "PARTIALLY_COVERED" | "FAILED" | "APPROVED" | "ORDERED" | "RECEIVED" | "CANCELLED";
}) {
  const palette: Record<string, string> = {
    NORMAL: "bg-emerald-100 text-emerald-800",
    WARNING: "bg-amber-100 text-amber-800",
    CRITICAL: "bg-rose-100 text-rose-800",
    PENDING: "bg-amber-100 text-amber-800",
    IN_TRANSIT: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    SEARCHING: "bg-cyan-100 text-cyan-800",
    COVERED: "bg-emerald-100 text-emerald-800",
    PARTIALLY_COVERED: "bg-amber-100 text-amber-800",
    FAILED: "bg-rose-100 text-rose-800",
    APPROVED: "bg-cyan-100 text-cyan-800",
    ORDERED: "bg-indigo-100 text-indigo-800",
    RECEIVED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        palette[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
