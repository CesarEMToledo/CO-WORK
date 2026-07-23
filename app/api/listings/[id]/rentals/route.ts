import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { calculateRentalEarnings } from "@/lib/earnings";

const createSchema = z
  .object({
    startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha de inicio inválida"),
    endDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Fecha de fin inválida"),
    grossAmount: z.number().positive("El monto cobrado debe ser mayor a 0"),
    guestName: z.string().trim().max(150).optional().or(z.literal("")),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "La fecha de fin no puede ser antes de la de inicio",
    path: ["endDate"],
  });

async function getOwnedRentalListing(id: string, ownerId: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { listing: null, forbidden: false };
  if (listing.ownerId !== ownerId) return { listing: null, forbidden: true };
  return { listing, forbidden: false };
}

/** Historial de rentas ya cobradas de una propiedad — solo el dueño lo ve. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const { listing, forbidden } = await getOwnedRentalListing(id, session.user.id);
  if (forbidden) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!listing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });

  const rentals = await prisma.rentalTransaction.findMany({
    where: { listingId: id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ rentals });
}

/**
 * Registra una renta ya cobrada (manual, por ahora) — el dueño anota fechas,
 * a quién le rentó y cuánto cobró en total; el servidor calcula y guarda el
 * desglose de comisiones/impuesto estimado en ese momento (ver lib/earnings.ts).
 *
 * Nota de alcance: esto NO cobra el pago por Stripe automáticamente — es un
 * registro de una renta que ya se cobró (en persona, transferencia, o vía un
 * checkout de Stripe que se conecte más adelante) para poder ver cuántas
 * veces se ha rentado la propiedad y las ganancias netas estimadas por mes.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const { listing, forbidden } = await getOwnedRentalListing(id, session.user.id);
  if (forbidden) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!listing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  if (listing.operation !== "RENTA") {
    return NextResponse.json(
      { error: "Solo las propiedades en renta pueden registrar rentas — las ventas no pasan por aquí." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const breakdown = calculateRentalEarnings(data.grossAmount);

  const rental = await prisma.rentalTransaction.create({
    data: {
      listingId: id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      guestName: data.guestName || null,
      notes: data.notes || null,
      grossAmount: breakdown.grossAmount,
      stripeFeeAmount: breakdown.stripeFeeAmount,
      platformFeeAmount: breakdown.platformFeeAmount,
      estimatedTaxAmount: breakdown.estimatedTaxAmount,
      netAmount: breakdown.netAmount,
    },
  });

  return NextResponse.json({ rental }, { status: 201 });
}
