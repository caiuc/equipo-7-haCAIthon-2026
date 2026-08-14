export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
    </header>
  );
}
