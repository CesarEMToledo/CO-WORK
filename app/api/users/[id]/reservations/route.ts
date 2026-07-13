import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrSelf } from "@/lib/permissions";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdminOrSelf(id);
  if (error) return error;

  const scope = request.nextUrl.searchParams.get("scope"); // past | active | future
  const now = new Date();

  const where: Record<string, unknown> = { userId: id };
  if (scope === "past") where.endAt = { lt: now };
  if (scope === "future") where.startAt = { gt: now };
  if (scope === "active") {
    where.startAt = { lte: now };
    where.endAt = { gte: now };
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: { property: { select: { name: true, type: true, siteId: true } } },
    orderBy: { startAt: "desc" },
  });

  return NextResponse.json({ data: reservations });
}
