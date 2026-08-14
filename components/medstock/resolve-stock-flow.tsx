"use client";

import type { PurchaseRequestStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type SearchResult = {
  stockRequestId: string;
  requesterHealthCenter: { id: string; name: string };
  medication: { id: string; name: string; dosage: string | null; unit: string | null };
  coverageDays: number;
  daysUntilNextRestock: number;
  temporaryDeficit: number;
  offers: Array<{
    nodeId: string;
    nodeName: string;
    availableQuantity: number;
    distanceKm: number;
    selectedQuantity: number;
    wouldBeUsed: boolean;
  }>;
  selectedOffers: Array<{
    nodeId: string;
    nodeName: string;
    quantity: number;
    distanceKm: number;
  }>;
  suggestedPurchaseRequest: {
    id: string;
    supplierName: string;
    quantity: number;
    status: PurchaseRequestStatus;
  } | null;
};

type TransferResult = {
  beforeStock: number;
  afterStock: number;
  beforeCoverageDays: number;
  afterCoverageDays: number;
};

export function ResolveStockFlow({
  scenario,
}: {
  scenario: {
    healthCenterId: string;
    medicationId: string;
    healthCenterName: string;
    medicationName: string;
    currentStock: number;
    coverageDays: number;
    daysUntilNextRestock: number;
  };
}) {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusLine = useMemo(() => {
    if (!searchResult) {
      return null;
    }

    if (searchResult.temporaryDeficit === 0) {
      return "No hay déficit temporal para este medicamento.";
    }

    return `Necesidad temporal: ${searchResult.temporaryDeficit} unidades`;
  }, [searchResult]);

  const displayedSelectedOffers = useMemo(
    () =>
      searchResult
        ? [...searchResult.selectedOffers].sort(
            (left, right) => left.quantity - right.quantity,
          )
        : [],
    [searchResult],
  );

  async function runSearch() {
    setLoading(true);
    setError(null);
    setTransferResult(null);

    try {
      const response = await fetch("/api/stock-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthCenterId: scenario.healthCenterId,
          medicationId: scenario.medicationId,
        }),
      });

      const payload = (await response.json()) as SearchResult | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "No se pudo buscar stock");
      }

      setSearchResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Error ejecutando la búsqueda de stock",
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmTransfer() {
    if (!searchResult) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockRequestId: searchResult.stockRequestId,
        }),
      });

      const payload = (await response.json()) as TransferResult | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "No se pudo confirmar");
      }

      setTransferResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Error confirmando transferencia",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">Riesgo detectado</h3>
      <p className="mt-3 text-slate-700">
        {scenario.healthCenterName} podría quedarse sin {scenario.medicationName} en{" "}
        {scenario.coverageDays.toFixed(1)} días.
      </p>
      <p className="mt-1 text-slate-700">
        La próxima reposición está programada para dentro de {scenario.daysUntilNextRestock} días.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={runSearch}
          disabled={loading}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Preguntar a mi red
        </button>

        {searchResult ? (
          <button
            type="button"
            onClick={confirmTransfer}
            disabled={loading || transferResult !== null || searchResult.selectedOffers.length === 0}
            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirmar transferencia
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
      ) : null}

      {searchResult ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
          <p className="text-sm font-medium text-cyan-900">{statusLine}</p>

          <div className="space-y-2 text-sm text-slate-700">
            {searchResult.offers.map((offer) => (
              <div
                key={offer.nodeId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3"
              >
                <p>
                  {offer.nodeName} responde automáticamente
                </p>
                <p className="font-medium">
                  {offer.availableQuantity > 0
                    ? `Puede entregar ${offer.availableQuantity}`
                    : "No tiene excedente"}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-sm text-slate-600">Oferta seleccionada:</p>
            {displayedSelectedOffers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-slate-800">
                {displayedSelectedOffers.map((offer) => (
                  <li key={offer.nodeId}>
                    {offer.nodeName} - {offer.quantity} unidades ({offer.distanceKm.toFixed(1)} km)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-rose-700">No se encontró cobertura en la red definida.</p>
            )}
          </div>

          {searchResult.suggestedPurchaseRequest ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Solicitud de compra generada</p>
              <p className="mt-1">Proveedor: {searchResult.suggestedPurchaseRequest.supplierName}</p>
              <p>Cantidad sugerida: {searchResult.suggestedPurchaseRequest.quantity} unidades</p>
              <p className="mt-2">
                <StatusBadge status={searchResult.suggestedPurchaseRequest.status} />
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {transferResult ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Transferencia confirmada</p>
          <p className="mt-1">Antes: {transferResult.beforeStock} unidades ({transferResult.beforeCoverageDays.toFixed(1)} días)</p>
          <p>Después: {transferResult.afterStock} unidades ({transferResult.afterCoverageDays.toFixed(1)} días)</p>
          <p className="mt-2 font-medium">Riesgo inmediato cubierto</p>
        </div>
      ) : null}
    </section>
  );
}
