import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

const VISIT_STATUSES = ["pending", "contacted", "confirmed", "cancelled"] as const;

const bodySchema = z.object({
  propertyId: z.string().min(1),
  propertyTitle: z.string().min(1),
  propertyLocation: z.string().min(1),
  type: z.enum(["visita", "reserva"]),
  requesterName: z.string().trim().min(2, "Ingresa tu nombre completo"),
  requesterPhone: z.string().trim().max(30).optional().or(z.literal("")),
  requesterEmail: z.string().trim().email("Correo inválido").optional().or(z.literal("")),
  visitDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
  visitTime: z.string().min(1, "Selecciona un horario"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  agentName: z.string().min(1),
  agentPhone: z.string().min(1),
});

/**
 * Public endpoint — anyone browsing the catalog (logged in or not) can
 * request a visit or reservation from the property detail page, so this
 * is intentionally not gated behind requireSession(). The record is saved
 * so it can be picked up later by an admin/agent dashboard; today the
 * confirmation flow also opens a prefilled WhatsApp message to the
 * assigned host as the actual notification channel.
 */
export async function POST(request: NextRequest) {
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

  const data = parsed.data;

  const visitRequest = await prisma.visitRequest.create({
    data: {
      propertyId: data.propertyId,
      propertyTitle: data.propertyTitle,
      propertyLocation: data.propertyLocation,
      type: data.type,
      requesterName: data.requesterName,
      requesterPhone: data.requesterPhone || null,
      requesterEmail: data.requesterEmail || null,
      visitDate: new Date(data.visitDate),
      visitTime: data.visitTime,
      message: data.message || null,
      agentName: data.agentName,
      agentPhone: data.agentPhone,
    },
  });

  return NextResponse.json({ id: visitRequest.id }, { status: 201 });
}

/** Admin-only listing — groundwork for a future visits/reservations dashboard. */
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const statusParam = request.nextUrl.searchParams.get("status");
  const status = (VISIT_STATUSES as readonly string[]).includes(statusParam ?? "")
    ? (statusParam as (typeof VISIT_STATUSES)[number])
    : undefined;

  const visitRequests = await prisma.visitRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: visitRequests });
}
