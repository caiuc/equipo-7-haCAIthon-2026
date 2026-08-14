import { PurchaseRequestStatus, StockRequestStatus, TransferStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSupplyNetworkForCenter } from "@/lib/node-session";
import {
  calculateDaysOfCoverage,
  calculateTemporaryDeficit,
  calculateTransferableStock,
  createPurchaseRequest,
  createTransfer,
  daysUntil,
  haversineDistanceKm,
  inventoryRiskState,
  selectTransferOffers,
  type TransferOfferCandidate,
} from "@/server/domain/medstock";

const TARGET_COVERAGE_DAYS = 30;

type NetworkSearchResult = {
  stockRequestId: string;
  requesterHealthCenter: {
    id: string;
    name: string;
  };
  medication: {
    id: string;
    name: string;
    dosage: string | null;
    unit: string | null;
  };
  coverageDays: number;
  daysUntilNextRestock: number;
  temporaryDeficit: number;
  requestStatus: StockRequestStatus;
  offers: Array<
    TransferOfferCandidate & {
      selectedQuantity: number;
      wouldBeUsed: boolean;
    }
  >;
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

export async function getInventorySnapshot(params: {
  healthCenterId?: string;
  medicationId?: string;
}) {
  const inventory = await prisma.inventory.findMany({
    where: {
      healthCenterId: params.healthCenterId,
      medicationId: params.medicationId,
    },
    include: {
      healthCenter: true,
      medication: true,
    },
    orderBy: [{ healthCenter: { name: "asc" } }, { medication: { name: "asc" } }],
  });

  return inventory.map((item) => {
    const daysUntilNextRestock = daysUntil(item.nextRestockDate);
    const coverageDays = calculateDaysOfCoverage(
      item.currentStock,
      item.estimatedDailyDemand,
    );
    const status = inventoryRiskState({
      currentStock: item.currentStock,
      estimatedDailyDemand: item.estimatedDailyDemand,
      safetyStockDays: item.safetyStockDays,
      daysUntilNextRestock,
    });

    return {
      id: item.id,
      healthCenterId: item.healthCenterId,
      healthCenterName: item.healthCenter.name,
      medicationId: item.medicationId,
      medicationName: item.medication.name,
      medicationDosage: item.medication.dosage,
      currentStock: item.currentStock,
      estimatedDailyDemand: item.estimatedDailyDemand,
      safetyStockDays: item.safetyStockDays,
      nextRestockDate: item.nextRestockDate,
      daysUntilNextRestock,
      coverageDays,
      status,
    };
  });
}

export async function runNetworkSearchAndCreateRequest(input: {
  healthCenterId: string;
  medicationId: string;
}): Promise<NetworkSearchResult> {
  const requesterInventory = await prisma.inventory.findFirst({
    where: {
      healthCenterId: input.healthCenterId,
      medicationId: input.medicationId,
    },
    include: {
      healthCenter: true,
      medication: true,
    },
  });

  if (!requesterInventory) {
    throw new Error("No existe inventario para ese centro y medicamento.");
  }

  const daysUntilNextRestock = daysUntil(requesterInventory.nextRestockDate);
  const coverageDays = calculateDaysOfCoverage(
    requesterInventory.currentStock,
    requesterInventory.estimatedDailyDemand,
  );

  const temporaryDeficit = calculateTemporaryDeficit({
    currentStock: requesterInventory.currentStock,
    estimatedDailyDemand: requesterInventory.estimatedDailyDemand,
    safetyStockDays: requesterInventory.safetyStockDays,
    daysUntilNextRestock,
  });

  const requestStatus =
    temporaryDeficit > 0 ? StockRequestStatus.SEARCHING : StockRequestStatus.COVERED;

  const stockRequest = await prisma.stockRequest.create({
    data: {
      requesterHealthCenterId: input.healthCenterId,
      medicationId: input.medicationId,
      quantityNeeded: temporaryDeficit,
      status: requestStatus,
    },
  });

  const networkCenterNames = getSupplyNetworkForCenter(requesterInventory.healthCenter.name);

  const allInventories = await prisma.inventory.findMany({
    where: {
      medicationId: input.medicationId,
      healthCenter: {
        name: {
          in: networkCenterNames,
        },
      },
    },
    include: {
      healthCenter: true,
    },
  });

  const discoveredOffers = allInventories
    .map((candidateInventory) => {
      const transferableStock = calculateTransferableStock({
        currentStock: candidateInventory.currentStock,
        estimatedDailyDemand: candidateInventory.estimatedDailyDemand,
        safetyStockDays: candidateInventory.safetyStockDays,
        daysUntilNextRestock: daysUntil(candidateInventory.nextRestockDate),
      });

      return {
        nodeId: candidateInventory.healthCenter.id,
        nodeName: candidateInventory.healthCenter.name,
        medicationId: input.medicationId,
        availableQuantity: transferableStock,
        distanceKm: Number(
          haversineDistanceKm(
            requesterInventory.healthCenter,
            candidateInventory.healthCenter,
          ).toFixed(2),
        ),
      };
    })
    .sort((left, right) => left.distanceKm - right.distanceKm);

  const validOffers = discoveredOffers.filter((offer) => offer.availableQuantity > 0);
  const selectedOffers = selectTransferOffers({
    temporaryDeficit,
    offers: validOffers,
  });

  const offeredTotal = selectedOffers.reduce(
    (sum, offer) => sum + offer.selectedQuantity,
    0,
  );

  const finalRequestStatus =
    temporaryDeficit === 0
      ? StockRequestStatus.COVERED
      : offeredTotal >= temporaryDeficit
        ? StockRequestStatus.COVERED
        : offeredTotal > 0
          ? StockRequestStatus.PARTIALLY_COVERED
          : StockRequestStatus.FAILED;

  await prisma.stockRequest.update({
    where: { id: stockRequest.id },
    data: {
      status: finalRequestStatus,
    },
  });

  if (discoveredOffers.length > 0) {
    await prisma.stockOffer.createMany({
      data: discoveredOffers.map((offer) => {
        const selected = selectedOffers.find((entry) => entry.nodeId === offer.nodeId);
        return {
          stockRequestId: stockRequest.id,
          providerHealthCenterId: offer.nodeId,
          quantityOffered: offer.availableQuantity,
          distanceKm: offer.distanceKm,
          accepted: false,
          selectedQuantity: selected?.selectedQuantity ?? 0,
        };
      }),
    });
  }

  const supplierLink = await prisma.medicationSupplier.findFirst({
    where: {
      medicationId: input.medicationId,
    },
    include: {
      supplier: true,
    },
  });

  let purchaseRequestResult: NetworkSearchResult["suggestedPurchaseRequest"] = null;

  if (supplierLink) {
    const projectedStockAtNextRestock = Math.max(
      0,
      requesterInventory.currentStock -
        requesterInventory.estimatedDailyDemand * daysUntilNextRestock,
    );
    const targetStock =
      requesterInventory.estimatedDailyDemand *
      (TARGET_COVERAGE_DAYS + requesterInventory.safetyStockDays);
    const suggestedPurchaseQuantity = Math.max(
      0,
      Math.ceil(targetStock - projectedStockAtNextRestock),
    );

    const requestData = createPurchaseRequest({
      healthCenterId: input.healthCenterId,
      medicationId: input.medicationId,
      supplierId: supplierLink.supplierId,
      quantity: suggestedPurchaseQuantity,
    });

    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        healthCenterId: requestData.healthCenterId,
        medicationId: requestData.medicationId,
        supplierId: requestData.supplierId,
        quantity: requestData.quantity,
        status: requestData.status,
      },
    });

    purchaseRequestResult = {
      id: purchaseRequest.id,
      supplierName: supplierLink.supplier.name,
      quantity: purchaseRequest.quantity,
      status: purchaseRequest.status,
    };
  }

  return {
    stockRequestId: stockRequest.id,
    requesterHealthCenter: {
      id: requesterInventory.healthCenter.id,
      name: requesterInventory.healthCenter.name,
    },
    medication: {
      id: requesterInventory.medication.id,
      name: requesterInventory.medication.name,
      dosage: requesterInventory.medication.dosage,
      unit: requesterInventory.medication.unit,
    },
    coverageDays,
    daysUntilNextRestock,
    temporaryDeficit,
    requestStatus: finalRequestStatus,
    offers: discoveredOffers.map((offer) => {
      const selected = selectedOffers.find((entry) => entry.nodeId === offer.nodeId);
      return {
        ...offer,
        selectedQuantity: selected?.selectedQuantity ?? 0,
        wouldBeUsed: Boolean(selected),
      };
    }),
    selectedOffers: selectedOffers.map((offer) => ({
      nodeId: offer.nodeId,
      nodeName: offer.nodeName,
      quantity: offer.selectedQuantity,
      distanceKm: offer.distanceKm,
    })),
    suggestedPurchaseRequest: purchaseRequestResult,
  };
}

export async function confirmTransferFromStockRequest(input: { stockRequestId: string }) {
  const stockRequest = await prisma.stockRequest.findUnique({
    where: { id: input.stockRequestId },
    include: {
      requesterHealthCenter: true,
      medication: true,
      offers: {
        include: {
          providerHealthCenter: true,
        },
        orderBy: [{ distanceKm: "asc" }, { quantityOffered: "desc" }],
      },
    },
  });

  if (!stockRequest) {
    throw new Error("No existe la solicitud de stock.");
  }

  const requesterInventory = await prisma.inventory.findFirst({
    where: {
      healthCenterId: stockRequest.requesterHealthCenterId,
      medicationId: stockRequest.medicationId,
    },
  });

  if (!requesterInventory) {
    throw new Error("No existe inventario del centro solicitante.");
  }

  const needed = stockRequest.quantityNeeded;
  let remaining = needed;
  const selectedTransfers: Array<{
    fromHealthCenterId: string;
    fromHealthCenterName: string;
    quantity: number;
  }> = [];

  for (const offer of stockRequest.offers) {
    if (remaining <= 0) {
      break;
    }

    const quantity = Math.min(
      offer.selectedQuantity > 0 ? offer.selectedQuantity : offer.quantityOffered,
      remaining,
    );

    if (quantity <= 0) {
      continue;
    }

    selectedTransfers.push({
      fromHealthCenterId: offer.providerHealthCenterId,
      fromHealthCenterName: offer.providerHealthCenter.name,
      quantity,
    });

    remaining -= quantity;
  }

  const requestedCoverageBefore = calculateDaysOfCoverage(
    requesterInventory.currentStock,
    requesterInventory.estimatedDailyDemand,
  );

  const transferRows = await prisma.$transaction(async (transaction) => {
    const createdTransfers = [];

    for (const selected of selectedTransfers) {
      const transferData = createTransfer({
        fromHealthCenterId: selected.fromHealthCenterId,
        toHealthCenterId: stockRequest.requesterHealthCenterId,
        medicationId: stockRequest.medicationId,
        quantity: selected.quantity,
      });

      const transfer = await transaction.transfer.create({
        data: {
          fromHealthCenterId: transferData.fromHealthCenterId,
          toHealthCenterId: transferData.toHealthCenterId,
          medicationId: transferData.medicationId,
          quantity: transferData.quantity,
          status: TransferStatus.COMPLETED,
        },
      });

      await transaction.stockOffer.updateMany({
        where: {
          stockRequestId: stockRequest.id,
          providerHealthCenterId: selected.fromHealthCenterId,
        },
        data: {
          accepted: true,
          selectedQuantity: selected.quantity,
        },
      });

      await transaction.inventory.updateMany({
        where: {
          healthCenterId: selected.fromHealthCenterId,
          medicationId: stockRequest.medicationId,
        },
        data: {
          currentStock: {
            decrement: selected.quantity,
          },
        },
      });

      await transaction.inventory.updateMany({
        where: {
          healthCenterId: stockRequest.requesterHealthCenterId,
          medicationId: stockRequest.medicationId,
        },
        data: {
          currentStock: {
            increment: selected.quantity,
          },
        },
      });

      createdTransfers.push(transfer);
    }

    const covered = selectedTransfers.reduce(
      (sum, transfer) => sum + transfer.quantity,
      0,
    );

    await transaction.stockRequest.update({
      where: {
        id: stockRequest.id,
      },
      data: {
        status:
          covered >= stockRequest.quantityNeeded
            ? StockRequestStatus.COVERED
            : covered > 0
              ? StockRequestStatus.PARTIALLY_COVERED
              : StockRequestStatus.FAILED,
      },
    });

    return createdTransfers;
  });

  const requesterInventoryAfter = await prisma.inventory.findFirstOrThrow({
    where: {
      healthCenterId: stockRequest.requesterHealthCenterId,
      medicationId: stockRequest.medicationId,
    },
  });

  const requestedCoverageAfter = calculateDaysOfCoverage(
    requesterInventoryAfter.currentStock,
    requesterInventoryAfter.estimatedDailyDemand,
  );

  return {
    stockRequestId: stockRequest.id,
    transfers: transferRows,
    beforeStock: requesterInventory.currentStock,
    afterStock: requesterInventoryAfter.currentStock,
    beforeCoverageDays: requestedCoverageBefore,
    afterCoverageDays: requestedCoverageAfter,
    requesterHealthCenterName: stockRequest.requesterHealthCenter.name,
    medicationName: stockRequest.medication.name,
  };
}
