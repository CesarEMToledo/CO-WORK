import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

const bodySchema = z.object({ agentId: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id: propertyId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "agentId requerido" }, { status: 400 });
  }

  const agent = await prisma.user.findUnique({ where: { id: parsed.data.agentId } });
  if (!agent || (agent.role !== "agent" && agent.role !== "broker")) {
    return NextResponse.json({ error: "El usuario no es agente ni broker" }, { status: 400 });
  }

  const assignment = await prisma.propertyAssignment.upsert({
    where: { propertyId_agentId: { propertyId, agentId: parsed.data.agentId } },
    update: {},
    create: { propertyId, agentId: parsed.data.agentId },
  });

  return NextResponse.json({ id: assignment.id }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id: propertyId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "agentId requerido" }, { status: 400 });
  }

  await prisma.propertyAssignment
    .delete({ where: { propertyId_agentId: { propertyId, agentId: parsed.data.agentId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
