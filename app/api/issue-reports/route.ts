import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";

const MAX_PHOTOS = 3;
const MAX_DATA_URL_LENGTH = 7_000_000; // ~5MB image, base64-encoded

const bodySchema = z.object({
  reservationId: z.string().min(1),
  category: z.enum(["maintenance", "cleaning", "internet", "other"]),
  description: z.string().trim().min(10, "Describe el problema con al menos 10 caracteres"),
  photos: z.array(z.string().startsWith("data:image/").max(MAX_DATA_URL_LENGTH)).max(MAX_PHOTOS).default([]),
});

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const reservation = await prisma.reservation.findUnique({ where: { id: parsed.data.reservationId } });
  if (!reservation || reservation.userId !== session.user.id) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const report = await prisma.issueReport.create({
    data: {
      reservationId: parsed.data.reservationId,
      userId: session.user.id,
      category: parsed.data.category,
      description: parsed.data.description,
      photos: parsed.data.photos,
    },
  });

  return NextResponse.json({ id: report.id }, { status: 201 });
}
