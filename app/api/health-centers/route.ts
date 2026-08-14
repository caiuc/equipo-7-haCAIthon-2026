import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const centers = await prisma.healthCenter.findMany({
    include: {
      inventories: {
        include: {
          medication: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(centers);
}
