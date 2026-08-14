import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const purchaseRequests = await prisma.purchaseRequest.findMany({
    include: {
      healthCenter: true,
      medication: true,
      supplier: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(purchaseRequests);
}
