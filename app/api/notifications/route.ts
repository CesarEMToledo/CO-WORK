import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";

/** Últimas notificaciones del usuario — las lee la campanita del navbar. */
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ notifications });
}
