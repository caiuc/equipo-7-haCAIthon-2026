import { NextRequest, NextResponse } from "next/server";
import { getInventorySnapshot } from "@/server/services/stock-request-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const healthCenterId = searchParams.get("healthCenterId") ?? undefined;
  const medicationId = searchParams.get("medicationId") ?? undefined;

  const snapshot = await getInventorySnapshot({
    healthCenterId,
    medicationId,
  });

  return NextResponse.json(snapshot);
}
