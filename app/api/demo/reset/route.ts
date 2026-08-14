import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

export async function POST() {
  try {
    await execFileAsync("npx", ["tsx", "prisma/seed.ts"], {
      cwd: process.cwd(),
      env: process.env,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo reiniciar el estado del demo.",
      },
      { status: 500 },
    );
  }
}
