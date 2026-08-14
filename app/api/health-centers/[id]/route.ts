import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const center = await prisma.healthCenter.findUnique({
    where: { id },
    include: {
      inventories: {
        include: {
          medication: true,
        },
        orderBy: {
          medication: {
            name: "asc",
          },
        },
      },
      incomingTransfers: {
        include: {
          from: true,
          medication: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      outgoingTransfers: {
        include: {
          to: true,
          medication: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      purchaseRequests: {
        include: {
          medication: true,
          supplier: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!center) {
    return NextResponse.json({ error: "Health center not found" }, { status: 404 });
  }

  return NextResponse.json(center);
}
