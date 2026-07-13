import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrSelf } from "@/lib/permissions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await requireAdminOrSelf(id);
  if (error) return error;

  const assignments = await prisma.propertyAssignment.findMany({
    where: { agentId: id },
    include: { property: true },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json({ data: assignments.map((a) => a.property) });
}
