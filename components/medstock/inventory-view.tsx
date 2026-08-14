"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type Row = {
  id: string;
  healthCenterId: string;
  healthCenterName: string;
  medicationId: string;
  medicationName: string;
  medicationDosage: string | null;
  currentStock: number;
  estimatedDailyDemand: number;
  coverageDays: number;
  daysUntilNextRestock: number;
  nextRestockDate: Date;
  status: "NORMAL" | "WARNING" | "CRITICAL";
};

export function InventoryView({ rows }: { rows: Row[] }) {
  const [centerFilter, setCenterFilter] = useState<string>("ALL");
  const [medicationFilter, setMedicationFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const centerOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.healthCenterName))).sort(),
    [rows],
  );

  const medicationOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.medicationName))).sort(),
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const centerOk = centerFilter === "ALL" || row.healthCenterName === centerFilter;
        const medicationOk =
          medicationFilter === "ALL" || row.medicationName === medicationFilter;
        const statusOk = statusFilter === "ALL" || row.status === statusFilter;
        return centerOk && medicationOk && statusOk;
      }),
    [centerFilter, medicationFilter, rows, statusFilter],
  );

  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={centerFilter}
          onChange={(event) => setCenterFilter(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ALL">Todos los centros</option>
          {centerOptions.map((center) => (
            <option key={center} value={center}>
              {center}
            </option>
          ))}
        </select>

        <select
          value={medicationFilter}
          onChange={(event) => setMedicationFilter(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ALL">Todos los medicamentos</option>
          {medicationOptions.map((medication) => (
            <option key={medication} value={medication}>
              {medication}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="ALL">Todos los estados</option>
          <option value="NORMAL">Normal</option>
          <option value="WARNING">Advertencia</option>
          <option value="CRITICAL">Crítico</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2 font-medium">Centro</th>
              <th className="px-3 py-2 font-medium">Medicamento</th>
              <th className="px-3 py-2 font-medium">Stock actual</th>
              <th className="px-3 py-2 font-medium">Consumo diario</th>
              <th className="px-3 py-2 font-medium">Días cobertura</th>
              <th className="px-3 py-2 font-medium">Próxima reposición</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-3 text-slate-900">{row.healthCenterName}</td>
                <td className="px-3 py-3 text-slate-900">
                  {row.medicationName} {row.medicationDosage ?? ""}
                </td>
                <td className="px-3 py-3 text-slate-700">{row.currentStock}</td>
                <td className="px-3 py-3 text-slate-700">{row.estimatedDailyDemand.toFixed(1)}</td>
                <td className="px-3 py-3 text-slate-700">{row.coverageDays.toFixed(1)}</td>
                <td className="px-3 py-3 text-slate-700">{row.daysUntilNextRestock} días</td>
                <td className="px-3 py-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
