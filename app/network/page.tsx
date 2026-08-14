import { Header } from "@/components/layout/header";
import { NetworkMap } from "@/components/medstock/network-map";
import { getActiveHealthCenter, getNetworkNodes, getTransfers } from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NetworkPage({ searchParams }: PageProps<"/network">) {
  const params = await searchParams;
  const activeCenter = await getActiveHealthCenter(readParam(params.node));
  const [nodes, transfers] = await Promise.all([
    getNetworkNodes({ activeHealthCenterName: activeCenter?.name }),
    getTransfers(),
  ]);

  const transferLines = transfers.map((transfer) => ({
    from: {
      latitude: transfer.from.latitude,
      longitude: transfer.from.longitude,
      name: transfer.from.name,
    },
    to: {
      latitude: transfer.to.latitude,
      longitude: transfer.to.longitude,
      name: transfer.to.name,
    },
  }));

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? "";

  return (
    <main className="space-y-6">
      <Header
        title="Red de salud"
        subtitle={
          activeCenter
            ? `Vista desde ${activeCenter.name}: verde pertenece a tu red, rojo queda fuera`
            : "Mapa de nodos con estado de inventario y transferencias"
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {activeCenter ? (
          <>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <p className="font-semibold">Azul</p>
              <p>Nodo activo</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Verde</p>
              <p>Parte de tu red de abastecimiento</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-semibold">Rojo</p>
              <p>Fuera de tu red de abastecimiento</p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Verde</p>
              <p>Operacion normal</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Amarillo</p>
              <p>Advertencia de cobertura</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-semibold">Rojo</p>
              <p>Riesgo critico de quiebre</p>
            </div>
          </>
        )}
      </div>

      <NetworkMap nodes={nodes} transfers={transferLines} apiKey={apiKey} />
    </main>
  );
}
