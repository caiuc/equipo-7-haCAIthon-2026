import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { calculateDaysOfCoverage, daysUntil, inventoryRiskState } from "@/server/domain/medstock";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HealthCenterDetailPage({ params }: PageProps) {
  const { id } = await params;

  const center = await prisma.healthCenter.findUnique({
    where: { id },
    include: {
      inventories: {
        include: {
          medication: true,
        },
        orderBy: {
          medication: {
            name: "asc",
          },
        },
      },
      incomingTransfers: {
        include: {
          from: true,
          medication: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
      outgoingTransfers: {
        include: {
          to: true,
          medication: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
      purchaseRequests: {
        include: {
          medication: true,
          supplier: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
    },
  });

  if (!center) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <Header title={center.name} subtitle={`${center.type} - ${center.address ?? "Sin dirección"}`} />

      <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Inventario completo</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-2 font-medium">Medicamento</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">Demanda diaria</th>
                <th className="px-3 py-2 font-medium">Cobertura</th>
                <th className="px-3 py-2 font-medium">Reposición</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {center.inventories.map((inventory) => {
                const nextRestockDays = daysUntil(inventory.nextRestockDate);
                const coverage = calculateDaysOfCoverage(
                  inventory.currentStock,
                  inventory.estimatedDailyDemand,
                );
                const status = inventoryRiskState({
                  currentStock: inventory.currentStock,
                  estimatedDailyDemand: inventory.estimatedDailyDemand,
                  safetyStockDays: inventory.safetyStockDays,
                  daysUntilNextRestock: nextRestockDays,
                });

                return (
                  <tr key={inventory.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      {inventory.medication.name} {inventory.medication.dosage ?? ""}
                    </td>
                    <td className="px-3 py-3">{inventory.currentStock}</td>
                    <td className="px-3 py-3">{inventory.estimatedDailyDemand.toFixed(1)}</td>
                    <td className="px-3 py-3">{coverage.toFixed(1)} días</td>
                    <td className="px-3 py-3">{nextRestockDays} días</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Transferencias entrantes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {center.incomingTransfers.map((transfer) => (
              <li key={transfer.id} className="rounded-xl bg-slate-50 p-3">
                {transfer.from.name} envió {transfer.quantity} de {transfer.medication.name}
              </li>
            ))}
            {center.incomingTransfers.length === 0 ? <li>Sin transferencias entrantes</li> : null}
          </ul>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Transferencias salientes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {center.outgoingTransfers.map((transfer) => (
              <li key={transfer.id} className="rounded-xl bg-slate-50 p-3">
                {transfer.to.name} recibió {transfer.quantity} de {transfer.medication.name}
              </li>
            ))}
            {center.outgoingTransfers.length === 0 ? <li>Sin transferencias salientes</li> : null}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Solicitudes de compra</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {center.purchaseRequests.map((request) => (
            <li key={request.id} className="rounded-xl bg-slate-50 p-3">
              {request.medication.name} - {request.quantity} unidades - {request.supplier.name} - {" "}
              <StatusBadge status={request.status} />
            </li>
          ))}
          {center.purchaseRequests.length === 0 ? <li>Sin solicitudes de compra</li> : null}
        </ul>
      </section>

      <Link
        href="/network"
        className="inline-flex rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Volver a red
      </Link>
    </main>
  );
}
