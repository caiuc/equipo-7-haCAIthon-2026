"use client";

import { PurchaseRequestStatus } from "@prisma/client";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type Row = {
  id: string;
  quantity: number;
  status: PurchaseRequestStatus;
  createdAt: Date;
  healthCenter: { name: string };
  medication: { name: string; dosage: string | null };
  supplier: { name: string };
};

const statuses: PurchaseRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "ORDERED",
  "RECEIVED",
  "CANCELLED",
];

export function PurchaseRequestsView({ rows }: { rows: Row[] }) {
  const [data, setData] = useState(rows);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: PurchaseRequestStatus) {
    setLoadingId(id);
    try {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado");
      }

      const updated = (await response.json()) as Row;
      setData((current) => current.map((row) => (row.id === id ? updated : row)));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2 font-medium">Centro</th>
              <th className="px-3 py-2 font-medium">Medicamento</th>
              <th className="px-3 py-2 font-medium">Proveedor</th>
              <th className="px-3 py-2 font-medium">Cantidad</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Fecha</th>
              <th className="px-3 py-2 font-medium">Actualizar</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-3">{row.healthCenter.name}</td>
                <td className="px-3 py-3">
                  {row.medication.name} {row.medication.dosage ?? ""}
                </td>
                <td className="px-3 py-3">{row.supplier.name}</td>
                <td className="px-3 py-3">{row.quantity}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-3 py-3">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="px-3 py-3">
                  <select
                    className="rounded-lg border border-slate-300 px-2 py-1"
                    defaultValue={row.status}
                    disabled={loadingId === row.id}
                    onChange={(event) =>
                      updateStatus(row.id, event.target.value as PurchaseRequestStatus)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
