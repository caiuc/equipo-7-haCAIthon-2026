export function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "green" | "yellow" | "red";
}) {
  const tones = {
    blue: "border-cyan-200 bg-cyan-50 text-cyan-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    yellow: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-rose-200 bg-rose-50 text-rose-900",
  } as const;

  return (
    <article className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
