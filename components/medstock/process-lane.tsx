const steps = [
  {
    title: "PREDICE",
    description: "Detecta futuros quiebres en base a cobertura, demanda y reposición.",
    color: "bg-cyan-600",
  },
  {
    title: "CUBRE",
    description: "Busca stock temporal en nodos cercanos y propone transferencias.",
    color: "bg-emerald-600",
  },
  {
    title: "REPONE",
    description: "Genera solicitud de compra para recuperar stock objetivo.",
    color: "bg-amber-500",
  },
];

export function ProcessLane() {
  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Flujo MedStock</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${step.color}`} />
              <p className="text-sm font-semibold tracking-wide text-slate-900">{step.title}</p>
            </div>
            <p className="mt-3 text-sm text-slate-600">{step.description}</p>
            {index < steps.length - 1 ? (
              <p className="mt-3 text-xl text-slate-300">↓</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
