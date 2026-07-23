import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";

/**
 * "Interesados" de una propiedad: gente que agendó una visita o reserva
 * desde la página pública de la propiedad. VisitRequest no tiene una
 * relación formal con Listing (propertyId es un string suelto, ver el
 * comentario en prisma/schema.prisma) — aquí simplemente se filtra por
 * coincidencia de id, que es válido porque las propiedades ahora se
 * publican con un id real de la base de datos.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, select: { ownerId: true } });
  if (!listing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  if (listing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const interesados = await prisma.visitRequest.findMany({
    where: { propertyId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ interesados });
}
