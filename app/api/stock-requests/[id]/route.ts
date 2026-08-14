import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const request = await prisma.stockRequest.findUnique({
    where: { id },
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

  if (!request) {
    return NextResponse.json({ error: "Stock request not found" }, { status: 404 });
  }

  return NextResponse.json(request);
}
