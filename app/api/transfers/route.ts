import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmTransferFromStockRequest } from "@/server/services/stock-request-service";

export async function GET() {
  const transfers = await prisma.transfer.findMany({
    include: {
      from: true,
      to: true,
      medication: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(transfers);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    stockRequestId?: string;
  };

  if (!body.stockRequestId) {
    return NextResponse.json(
      { error: "stockRequestId es requerido." },
      { status: 400 },
    );
  }

  try {
    const result = await confirmTransferFromStockRequest({
      stockRequestId: body.stockRequestId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error confirmando transferencia",
      },
      { status: 400 },
    );
  }
}
