import { prisma } from "@/lib/prisma";
import {
  getCredentialsForCenter,
  getHealthCenterNameForUsername,
  getNodeCredentials,
  getSupplyNetworkForCenter,
  getSupplyRelation,
} from "@/lib/node-session";
import {
  calculateDaysOfCoverage,
  daysUntil,
  inventoryRiskState,
} from "@/server/domain/medstock";

export async function getHealthCenterAccessOptions() {
  const centers = await prisma.healthCenter.findMany({
    orderBy: { name: "asc" },
  });

  const seededCenterNames = new Set(centers.map((center) => center.name));

  return getNodeCredentials().filter((credentials) =>
    seededCenterNames.has(credentials.healthCenterName),
  );
}

export async function getActiveHealthCenter(username?: string | null) {
  const healthCenterName = getHealthCenterNameForUsername(username);

  if (!healthCenterName) {
    return null;
  }

  const center = await prisma.healthCenter.findFirst({
    where: { name: healthCenterName },
  });

  if (!center) {
    return null;
  }

  return {
    ...center,
    username,
    supplyNetwork: getSupplyNetworkForCenter(center.name),
  };
}

export async function getDashboardData(params?: { healthCenterId?: string }) {
  const [centersCount, medsCount, inventoryRows, transfers, purchaseRequests] =
    await Promise.all([
      prisma.healthCenter.count(),
      prisma.medication.count(),
      prisma.inventory.findMany({
        where: { healthCenterId: params?.healthCenterId },
      }),
      prisma.transfer.findMany({
        where: {
          status: "PENDING",
          ...(params?.healthCenterId
            ? {
                OR: [
                  { fromHealthCenterId: params.healthCenterId },
                  { toHealthCenterId: params.healthCenterId },
                ],
              }
            : {}),
        },
      }),
      prisma.purchaseRequest.findMany({
        where: {
          status: "PENDING",
          healthCenterId: params?.healthCenterId,
        },
      }),
    ]);

  const risks = inventoryRows.filter((inventory) => {
    const daysUntilNextRestock = daysUntil(inventory.nextRestockDate);
    const status = inventoryRiskState({
      currentStock: inventory.currentStock,
      estimatedDailyDemand: inventory.estimatedDailyDemand,
      safetyStockDays: inventory.safetyStockDays,
      daysUntilNextRestock,
    });
    return status === "CRITICAL";
  }).length;

  return {
    centersCount,
    medsCount,
    risks,
    suggestedTransfers: transfers.length,
    pendingPurchases: purchaseRequests.length,
  };
}

export async function getInventoryWithStatus(params?: {
  healthCenterId?: string;
  medicationId?: string;
}) {
  const rows = await prisma.inventory.findMany({
    where: {
      healthCenterId: params?.healthCenterId,
      medicationId: params?.medicationId,
    },
    include: {
      healthCenter: true,
      medication: true,
    },
    orderBy: [{ healthCenter: { name: "asc" } }, { medication: { name: "asc" } }],
  });

  return rows.map((inventory) => {
    const daysUntilNextRestock = daysUntil(inventory.nextRestockDate);
    const coverageDays = calculateDaysOfCoverage(
      inventory.currentStock,
      inventory.estimatedDailyDemand,
    );
    const status = inventoryRiskState({
      currentStock: inventory.currentStock,
      estimatedDailyDemand: inventory.estimatedDailyDemand,
      safetyStockDays: inventory.safetyStockDays,
      daysUntilNextRestock,
    });

    return {
      id: inventory.id,
      healthCenterId: inventory.healthCenterId,
      healthCenterName: inventory.healthCenter.name,
      medicationId: inventory.medicationId,
      medicationName: inventory.medication.name,
      medicationDosage: inventory.medication.dosage,
      currentStock: inventory.currentStock,
      estimatedDailyDemand: inventory.estimatedDailyDemand,
      safetyStockDays: inventory.safetyStockDays,
      nextRestockDate: inventory.nextRestockDate,
      daysUntilNextRestock,
      coverageDays,
      status,
    };
  });
}

export async function getNetworkNodes(params?: { activeHealthCenterName?: string | null }) {
  const [centers, inventory] = await Promise.all([
    prisma.healthCenter.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.inventory.findMany({
      include: { medication: true },
    }),
  ]);

  const statusByCenterId = new Map<string, "NORMAL" | "WARNING" | "CRITICAL">();

  for (const center of centers) {
    const rows = inventory.filter((row) => row.healthCenterId === center.id);

    let status: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";
    for (const row of rows) {
      const rowStatus = inventoryRiskState({
        currentStock: row.currentStock,
        estimatedDailyDemand: row.estimatedDailyDemand,
        safetyStockDays: row.safetyStockDays,
        daysUntilNextRestock: daysUntil(row.nextRestockDate),
      });

      if (rowStatus === "CRITICAL") {
        status = "CRITICAL";
        break;
      }

      if (rowStatus === "WARNING") {
        status = "WARNING";
      }
    }

    statusByCenterId.set(center.id, status);
  }

  return centers.map((center) => {
    const rows = inventory.filter((row) => row.healthCenterId === center.id);
    const criticalRows = rows.filter((row) => {
      const rowStatus = inventoryRiskState({
        currentStock: row.currentStock,
        estimatedDailyDemand: row.estimatedDailyDemand,
        safetyStockDays: row.safetyStockDays,
        daysUntilNextRestock: daysUntil(row.nextRestockDate),
      });
      return rowStatus === "CRITICAL";
    });

    return {
      id: center.id,
      name: center.name,
      username: getCredentialsForCenter(center.name)?.username ?? null,
      type: center.type,
      address: center.address,
      latitude: center.latitude,
      longitude: center.longitude,
      status: statusByCenterId.get(center.id) ?? "NORMAL",
      supplyRelation: getSupplyRelation({
        activeCenterName: params?.activeHealthCenterName,
        candidateCenterName: center.name,
      }),
      alerts: criticalRows.map((row) => row.medication.name),
    };
  });
}

export async function getFlowScenario(params: { healthCenterId: string }) {
  const rows = await prisma.inventory.findMany({
    where: {
      healthCenterId: params.healthCenterId,
    },
    include: {
      healthCenter: true,
      medication: true,
    },
    orderBy: [{ medication: { name: "asc" } }],
  });

  const inventory = rows.find((row) => {
    const daysUntilNextRestock = daysUntil(row.nextRestockDate);
    return (
      inventoryRiskState({
        currentStock: row.currentStock,
        estimatedDailyDemand: row.estimatedDailyDemand,
        safetyStockDays: row.safetyStockDays,
        daysUntilNextRestock,
      }) === "CRITICAL"
    );
  });

  if (!inventory) {
    return null;
  }

  const coverageDays = calculateDaysOfCoverage(
    inventory.currentStock,
    inventory.estimatedDailyDemand,
  );

  return {
    healthCenterId: inventory.healthCenter.id,
    medicationId: inventory.medication.id,
    healthCenterName: inventory.healthCenter.name,
    medicationName: `${inventory.medication.name} ${inventory.medication.dosage ?? ""}`.trim(),
    currentStock: inventory.currentStock,
    coverageDays,
    daysUntilNextRestock: daysUntil(inventory.nextRestockDate),
  };
}

export async function getNodeInboxOffers(healthCenterId?: string) {
  if (!healthCenterId) {
    return [];
  }

  const offers = await prisma.stockOffer.findMany({
    where: {
      providerHealthCenterId: healthCenterId,
    },
    include: {
      stockRequest: {
        include: {
          requesterHealthCenter: true,
          medication: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return offers.map((offer) => ({
    id: offer.id,
    requesterName: offer.stockRequest.requesterHealthCenter.name,
    medicationName: `${offer.stockRequest.medication.name} ${
      offer.stockRequest.medication.dosage ?? ""
    }`.trim(),
    quantityNeeded: offer.stockRequest.quantityNeeded,
    quantityOffered: offer.quantityOffered,
    selectedQuantity: offer.selectedQuantity,
    distanceKm: offer.distanceKm,
    status: offer.accepted ? "Aceptada" : "Respondida automáticamente",
  }));
}

export async function getTransfers() {
  return prisma.transfer.findMany({
    include: {
      from: true,
      to: true,
      medication: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseRequests() {
  return prisma.purchaseRequest.findMany({
    include: {
      healthCenter: true,
      medication: true,
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
