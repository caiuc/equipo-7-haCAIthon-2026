import { NextRequest, NextResponse } from "next/server";
import { PurchaseRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const allowedStatus = new Set<PurchaseRequestStatus>([
  PurchaseRequestStatus.PENDING,
  PurchaseRequestStatus.APPROVED,
  PurchaseRequestStatus.ORDERED,
  PurchaseRequestStatus.RECEIVED,
  PurchaseRequestStatus.CANCELLED,
]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: PurchaseRequestStatus;
  };

  if (!body.status || !allowedStatus.has(body.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: body.status,
    },
    include: {
      healthCenter: true,
      medication: true,
      supplier: true,
    },
  });

  return NextResponse.json(updated);
}
