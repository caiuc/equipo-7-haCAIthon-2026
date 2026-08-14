import { Header } from "@/components/layout/header";
import { NodeInbox } from "@/components/medstock/node-inbox";
import { NodeLogin } from "@/components/medstock/node-login";
import { ProcessLane } from "@/components/medstock/process-lane";
import { ResolveStockFlow } from "@/components/medstock/resolve-stock-flow";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  getActiveHealthCenter,
  getDashboardData,
  getFlowScenario,
  getHealthCenterAccessOptions,
  getNodeInboxOffers,
} from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const activeUsername = readParam(params.node);
  const [accessOptions, activeCenter] = await Promise.all([
    getHealthCenterAccessOptions(),
    getActiveHealthCenter(activeUsername),
  ]);

  const [dashboard, scenario, inboxOffers] = await Promise.all([
    getDashboardData({ healthCenterId: activeCenter?.id }),
    activeCenter ? getFlowScenario({ healthCenterId: activeCenter.id }) : Promise.resolve(null),
    getNodeInboxOffers(activeCenter?.id),
  ]);

  return (
    <main className="space-y-6">
      <Header
        title="Dashboard MedStock"
        subtitle="Gestión de stock distribuida para la red de salud pública"
      />

      <NodeLogin nodes={accessOptions} activeUsername={activeCenter?.username ?? undefined} />

      {activeCenter ? (
        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-700">
                Nodo activo
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                {activeCenter.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{activeCenter.address}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">Red de abastecimiento</p>
              <p className="mt-1">{activeCenter.supplyNetwork.join(", ")}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label={activeCenter ? "Centros en la red" : "Centros conectados"}
          value={String(activeCenter ? activeCenter.supplyNetwork.length : dashboard.centersCount)}
          tone="blue"
        />
        <KpiCard label="Medicamentos monitoreados" value={String(dashboard.medsCount)} tone="green" />
        <KpiCard label="Riesgos de quiebre" value={String(dashboard.risks)} tone="red" />
        <KpiCard label="Transferencias sugeridas" value={String(dashboard.suggestedTransfers)} tone="yellow" />
        <KpiCard label="Solicitudes pendientes" value={String(dashboard.pendingPurchases)} tone="blue" />
      </section>

      {activeCenter && scenario ? (
        <ResolveStockFlow scenario={scenario} />
      ) : (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          {activeCenter
            ? "Este nodo no tiene riesgos críticos de quiebre en este momento."
            : "Selecciona un nodo para ver su stock, su red y sus solicitudes."}
        </section>
      )}

      {activeCenter ? <NodeInbox offers={inboxOffers} /> : null}

      <ProcessLane />
    </main>
  );
}
