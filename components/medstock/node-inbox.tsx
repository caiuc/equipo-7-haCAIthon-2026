type InboxOffer = {
  id: string;
  requesterName: string;
  medicationName: string;
  quantityNeeded: number;
  quantityOffered: number;
  selectedQuantity: number;
  distanceKm: number;
  status: string;
};

export function NodeInbox({ offers }: { offers: InboxOffer[] }) {
  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">Bandeja automatica del nodo</h3>
      <p className="mt-2 text-sm text-slate-600">
        Respuestas generadas cuando otro centro de la red consulta si este nodo puede compartir stock.
      </p>

      {offers.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Este nodo aun no ha recibido solicitudes de abastecimiento.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-semibold text-slate-950">
                  {offer.requesterName} solicita {offer.medicationName}
                </p>
                <p className="mt-1 text-slate-600">
                  Necesita {offer.quantityNeeded} unidades. Distancia estimada:{" "}
                  {offer.distanceKm.toFixed(1)} km.
                </p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-right">
                <p className="font-semibold text-emerald-700">
                  Responde {offer.quantityOffered} unidades
                </p>
                <p className="mt-1 text-slate-500">
                  Seleccionadas: {offer.selectedQuantity} / Estado: {offer.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
