import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTransfers } from "@/lib/data/medstock";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const transfers = await getTransfers();

  return (
    <main className="space-y-6">
      <Header title="Transferencias" subtitle="Movimientos laterales entre nodos" />

      <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-2 font-medium">Origen</th>
                <th className="px-3 py-2 font-medium">Destino</th>
                <th className="px-3 py-2 font-medium">Medicamento</th>
                <th className="px-3 py-2 font-medium">Cantidad</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-slate-100">
                  <td className="px-3 py-3">{transfer.from.name}</td>
                  <td className="px-3 py-3">{transfer.to.name}</td>
                  <td className="px-3 py-3">
                    {transfer.medication.name} {transfer.medication.dosage ?? ""}
                  </td>
                  <td className="px-3 py-3">{transfer.quantity}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={transfer.status} />
                  </td>
                  <td className="px-3 py-3">{transfer.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
