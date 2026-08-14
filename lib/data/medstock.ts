import { prisma } from "@/lib/prisma";
import {
  calculateDaysOfCoverage,
  daysUntil,
  inventoryRiskState,
} from "@/server/domain/medstock";

export async function getDashboardData() {
  const [centersCount, medsCount, inventoryRows, transfers, purchaseRequests] =
    await Promise.all([
      prisma.healthCenter.count(),
      prisma.medication.count(),
      prisma.inventory.findMany(),
      prisma.transfer.findMany({ where: { status: "PENDING" } }),
      prisma.purchaseRequest.findMany({ where: { status: "PENDING" } }),
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

export async function getNetworkNodes() {
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
      type: center.type,
      address: center.address,
      latitude: center.latitude,
      longitude: center.longitude,
      status: statusByCenterId.get(center.id) ?? "NORMAL",
      alerts: criticalRows.map((row) => row.medication.name),
    };
  });
}

export async function getFlowScenario() {
  const center = await prisma.healthCenter.findFirst({
    where: { name: "CESFAM B" },
  });

  if (!center) {
    throw new Error("No existe CESFAM B. Corre el seed de Prisma.");
  }

  const medication = await prisma.medication.findFirst({
    where: { name: "Losartan" },
  });

  if (!medication) {
    throw new Error("No existe Losartan en la base de datos.");
  }

  const inventory = await prisma.inventory.findFirst({
    where: {
      healthCenterId: center.id,
      medicationId: medication.id,
    },
  });

  if (!inventory) {
    throw new Error("No existe inventario del escenario para CESFAM B.");
  }

  const coverageDays = calculateDaysOfCoverage(
    inventory.currentStock,
    inventory.estimatedDailyDemand,
  );

  return {
    healthCenterId: center.id,
    medicationId: medication.id,
    healthCenterName: center.name,
    medicationName: `${medication.name} ${medication.dosage ?? ""}`.trim(),
    currentStock: inventory.currentStock,
    coverageDays,
    daysUntilNextRestock: daysUntil(inventory.nextRestockDate),
  };
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
