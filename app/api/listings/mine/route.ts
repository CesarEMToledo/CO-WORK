import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { listingToProperty } from "@/lib/listing-mapper";
import { groupEarningsByMonth } from "@/lib/earnings";
import { FEATURED_MAX_ACTIVE_SLOTS, countActiveFeaturedSlots } from "@/lib/featured";

/**
 * Todo lo que necesita el dashboard "Mis propiedades": las propiedades del
 * usuario (con sus partes de dirección para poder editarlas), cuántos
 * interesados y rentas tiene cada una, y las ganancias netas agrupadas por
 * mes de TODAS sus propiedades en renta juntas.
 */
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const listings = await prisma.listing.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, phone: true } } },
  });

  if (listings.length === 0) {
    const activeFeaturedCount = await countActiveFeaturedSlots();
    return NextResponse.json({
      listings: [],
      monthlyEarnings: [],
      activeFeaturedCount,
      maxFeaturedSlots: FEATURED_MAX_ACTIVE_SLOTS,
    });
  }

  const listingIds = listings.map((l) => l.id);

  const [interesadosCounts, rentalStats, allTransactions, activeFeaturedSlots, activeFeaturedCount] =
    await Promise.all([
      prisma.visitRequest.groupBy({
        by: ["propertyId"],
        where: { propertyId: { in: listingIds } },
        _count: { _all: true },
      }),
      prisma.rentalTransaction.groupBy({
        by: ["listingId"],
        where: { listingId: { in: listingIds } },
        _count: { _all: true },
        _sum: { netAmount: true },
      }),
      prisma.rentalTransaction.findMany({
        where: { listingId: { in: listingIds } },
        orderBy: { startDate: "desc" },
      }),
      // Cupo activo (si hay) en "Colecciones Destacadas" de cada una de MIS
      // propiedades — para mostrar el botón de "Destacar" o el badge de que
      // ya está destacada hasta tal fecha (ver FeatureListingButton).
      prisma.featuredSlot.findMany({
        where: { listingId: { in: listingIds }, endDate: { gt: new Date() } },
      }),
      countActiveFeaturedSlots(),
    ]);

  const interesadosByListing = new Map(interesadosCounts.map((c) => [c.propertyId, c._count._all]));
  const rentalStatsByListing = new Map(
    rentalStats.map((s) => [s.listingId, { count: s._count._all, netTotal: Number(s._sum.netAmount ?? 0) }])
  );
  const featuredUntilByListing = new Map(activeFeaturedSlots.map((f) => [f.listingId, f.endDate.toISOString()]));

  const data = listings.map((listing) => {
    const rentalInfo = rentalStatsByListing.get(listing.id);
    return {
      ...listingToProperty(listing, listing.owner),
      // Campos extra, solo para el dueño (no forman parte del shape público Property):
      estado: listing.estado,
      municipio: listing.municipio,
      localidad: listing.localidad,
      calle: listing.calle,
      numero: listing.numero,
      colonia: listing.colonia,
      interesadosCount: interesadosByListing.get(listing.id) ?? 0,
      rentalCount: rentalInfo?.count ?? 0,
      totalNetEarnings: rentalInfo?.netTotal ?? 0,
      featuredUntil: featuredUntilByListing.get(listing.id) ?? null,
    };
  });

  const monthlyEarnings = groupEarningsByMonth(allTransactions);

  return NextResponse.json({
    listings: data,
    monthlyEarnings,
    activeFeaturedCount,
    maxFeaturedSlots: FEATURED_MAX_ACTIVE_SLOTS,
  });
}
