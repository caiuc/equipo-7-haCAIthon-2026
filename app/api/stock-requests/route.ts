import { NextRequest, NextResponse } from "next/server";
import { runNetworkSearchAndCreateRequest } from "@/server/services/stock-request-service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    healthCenterId?: string;
    medicationId?: string;
  };

  if (!body.healthCenterId || !body.medicationId) {
    return NextResponse.json(
      { error: "healthCenterId y medicationId son requeridos." },
      { status: 400 },
    );
  }

  try {
    const result = await runNetworkSearchAndCreateRequest({
      healthCenterId: body.healthCenterId,
      medicationId: body.medicationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error ejecutando búsqueda de stock",
      },
      { status: 400 },
    );
  }
}
