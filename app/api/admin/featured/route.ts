import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { groupEarningsByMonth } from "@/lib/earnings";
import { FEATURED_MAX_ACTIVE_SLOTS } from "@/lib/featured";

/**
 * Panel de administración de "Colecciones Destacadas": historial completo
 * de cupos (pagados y regalados), ganancias mensuales de esto (mismo
 * cálculo que las rentas, ver lib/earnings.ts) y qué propiedades se pueden
 * agregar gratis todavía (las que no tienen un cupo activo esta semana).
 * Agregar un cupo nuevo se hace con el mismo POST /api/featured que usan los
 * dueños — aquí solo se lee.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();

  try {
    const [slots, activeListingIds, candidateListings] = await Promise.all([
      prisma.featuredSlot.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          listing: { select: { title: true, operation: true, location: true } },
          addedBy: { select: { name: true } },
        },
      }),
      prisma.featuredSlot.findMany({
        where: { endDate: { gt: now } },
        select: { listingId: true },
      }),
      prisma.listing.findMany({
        where: { status: "disponible" },
        select: { id: true, title: true, operation: true, location: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    const activeIds = new Set(activeListingIds.map((f) => f.listingId));
    const availableListings = candidateListings.filter((l) => !activeIds.has(l.id));

    return NextResponse.json({
      slots,
      activeCount: activeIds.size,
      maxSlots: FEATURED_MAX_ACTIVE_SLOTS,
      monthlyEarnings: groupEarningsByMonth(slots),
      availableListings,
    });
  } catch (err) {
    // Si esto truena (p. ej. porque se agregó el modelo FeaturedSlot al
    // schema y todavía no se corrió "prisma migrate dev" / el servidor no se
    // reinició después de "prisma generate" — ver nota en
    // app/api/listings/route.ts), mandamos el motivo real al navegador en
    // vez de dejar que Next devuelva una página de error sin JSON (lo cual
    // hacía que el panel solo mostrara "revisa tu conexión" sin ninguna pista).
    console.error("Error al cargar el panel de destacados:", err);
    return NextResponse.json(
      {
        error: `No se pudo cargar el panel de destacados: ${
          err instanceof Error ? err.message : "error desconocido"
        }`,
      },
      { status: 500 }
    );
  }
}
