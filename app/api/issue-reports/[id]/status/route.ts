import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

const bodySchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const updated = await prisma.issueReport
    .update({ where: { id }, data: { status: parsed.data.status } })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ id: updated.id, status: updated.status });
}
