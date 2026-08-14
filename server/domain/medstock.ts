export type InventoryMathInput = {
  currentStock: number;
  estimatedDailyDemand: number;
  safetyStockDays: number;
  daysUntilNextRestock: number;
};

export type TransferOfferCandidate = {
  nodeId: string;
  nodeName: string;
  medicationId: string;
  availableQuantity: number;
  distanceKm: number;
};

export type SelectedTransfer = TransferOfferCandidate & {
  selectedQuantity: number;
};

export function calculateDailyDemand(consumptionValues: number[]) {
  if (consumptionValues.length === 0) {
    return 0;
  }

  const total = consumptionValues.reduce((sum, value) => sum + value, 0);
  return total / consumptionValues.length;
}

export function calculateDaysOfCoverage(currentStock: number, estimatedDailyDemand: number) {
  if (estimatedDailyDemand <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return currentStock / estimatedDailyDemand;
}

export function predictStockout(input: InventoryMathInput) {
  const daysOfCoverage = calculateDaysOfCoverage(
    input.currentStock,
    input.estimatedDailyDemand,
  );
  return daysOfCoverage < input.daysUntilNextRestock;
}

export function calculateTemporaryDeficit(input: InventoryMathInput) {
  const requiredStock =
    input.estimatedDailyDemand *
    (input.daysUntilNextRestock + input.safetyStockDays);

  return Math.max(0, Math.ceil(requiredStock - input.currentStock));
}

export function calculateTransferableStock(input: InventoryMathInput) {
  const projectedConsumptionUntilRestock =
    input.estimatedDailyDemand * input.daysUntilNextRestock;
  const safetyStock = input.estimatedDailyDemand * input.safetyStockDays;

  return Math.max(
    0,
    Math.floor(
      input.currentStock - projectedConsumptionUntilRestock - safetyStock,
    ),
  );
}

export function haversineDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function findNearbyNodes<T extends { latitude: number; longitude: number }>(
  requesterNode: T,
  candidateNodes: T[],
  maxDistanceKm: number,
) {
  return candidateNodes
    .map((candidate) => ({
      candidate,
      distanceKm: haversineDistanceKm(requesterNode, candidate),
    }))
    .filter((entry) => entry.distanceKm <= maxDistanceKm)
    .sort((left, right) => left.distanceKm - right.distanceKm);
}

export function requestStockFromNeighbors(params: {
  requesterDeficit: number;
  offers: TransferOfferCandidate[];
}) {
  let total = 0;
  const accepted: TransferOfferCandidate[] = [];

  for (const offer of params.offers) {
    if (total >= params.requesterDeficit) {
      break;
    }
    accepted.push(offer);
    total += offer.availableQuantity;
  }

  return {
    accepted,
    totalOffered: total,
  };
}

export function selectTransferOffers(params: {
  temporaryDeficit: number;
  offers: TransferOfferCandidate[];
}) {
  if (params.temporaryDeficit <= 0) {
    return [] as SelectedTransfer[];
  }

  const sortedOffers = [...params.offers].sort((left, right) => {
    if (left.distanceKm !== right.distanceKm) {
      return left.distanceKm - right.distanceKm;
    }
    return right.availableQuantity - left.availableQuantity;
  });

  const selected: SelectedTransfer[] = [];
  let remaining = params.temporaryDeficit;

  for (const offer of sortedOffers) {
    if (remaining <= 0) {
      break;
    }

    const selectedQuantity = Math.min(offer.availableQuantity, remaining);
    if (selectedQuantity <= 0) {
      continue;
    }

    selected.push({
      ...offer,
      selectedQuantity,
    });

    remaining -= selectedQuantity;
  }

  return selected;
}

export function createTransfer(input: {
  fromHealthCenterId: string;
  toHealthCenterId: string;
  medicationId: string;
  quantity: number;
}) {
  return {
    ...input,
    status: "COMPLETED" as const,
  };
}

export function createPurchaseRequest(input: {
  healthCenterId: string;
  medicationId: string;
  supplierId: string;
  quantity: number;
}) {
  return {
    ...input,
    status: "PENDING" as const,
  };
}

export function inventoryRiskState(input: InventoryMathInput):
  | "NORMAL"
  | "WARNING"
  | "CRITICAL" {
  const coverage = calculateDaysOfCoverage(
    input.currentStock,
    input.estimatedDailyDemand,
  );

  if (coverage < input.daysUntilNextRestock) {
    return "CRITICAL";
  }

  if (coverage < input.daysUntilNextRestock + input.safetyStockDays) {
    return "WARNING";
  }

  return "NORMAL";
}

export function daysUntil(date: Date) {
  const diffMs = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}
