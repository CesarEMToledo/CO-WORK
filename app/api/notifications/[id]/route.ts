import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";

/** Marca una notificación como leída — solo su dueño puede hacerlo. */
export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (notification.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ notification: updated });
}
