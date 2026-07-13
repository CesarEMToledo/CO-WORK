import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const properties = await prisma.property.findMany({
    include: { site: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: properties });
}
