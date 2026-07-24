import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { listingToProperty } from "@/lib/listing-mapper";
import { calculateRentalEarnings } from "@/lib/earnings";
import {
  FEATURED_WEEKLY_PRICE_MXN,
  FEATURED_MAX_ACTIVE_SLOTS,
  featuredEndDate,
  countActiveFeaturedSlots,
} from "@/lib/featured";

/**
 * Catálogo público de "Colecciones Destacadas" — las propiedades con un
 * cupo activo (pagado o regalado por un admin) esta semana. Sin protección
 * de sesión a propósito, igual que /api/listings: el carrusel de inicio lo
 * debe poder ver cualquiera, con o sin cuenta.
 */
export async function GET() {
  try {
    const slots = await prisma.featuredSlot.findMany({
      where: { endDate: { gt: new Date() } },
      orderBy: { startDate: "asc" },
      include: { listing: { include: { owner: { select: { name: true, phone: true } } } } },
    });

    return NextResponse.json({
      listings: slots.map((s) => listingToProperty(s.listing, s.listing.owner)),
      activeCount: slots.length,
      maxSlots: FEATURED_MAX_ACTIVE_SLOTS,
    });
  } catch (err) {
    // Ver la nota igual en app/api/listings/route.ts: sin este try/catch,
    // un error del lado del servidor (p. ej. la tabla FeaturedSlot todavía
    // no existe porque falta correr "prisma migrate dev") le llega al
    // navegador como una página de error sin JSON, y Home.tsx se queda sin
    // pista de qué pasó. Aquí simplemente se ignora y se muestra el
    // catálogo curado de respaldo (ver useFeaturedListings / Home.tsx), pero
    // logueamos el motivo real en la consola del servidor para poder
    // diagnosticarlo.
    console.error("Error al cargar Colecciones Destacadas:", err);
    return NextResponse.json(
      { listings: [], activeCount: 0, maxSlots: FEATURED_MAX_ACTIVE_SLOTS },
      { status: 200 }
    );
  }
}

const createSchema = z.object({ listingId: z.string().min(1) });

/**
 * Pide un cupo en "Colecciones Destacadas" para una propiedad — 7 días por
 * $50 MXN. El dueño paga (por ahora simulado: no se cobra de verdad por
 * Stripe todavía, ver lib/featured.ts); un administrador puede además
 * agregar CUALQUIER propiedad ajena gratis (isComplimentary), pero ese cupo
 * gratis sigue contando contra el máximo de 6 igual que uno pagado.
 */
export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Falta el id de la propiedad" }, { status: 400 });
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
    if (!listing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });

    const isOwner = listing.ownerId === session.user.id;
    const isAdmin = session.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const existingActive = await prisma.featuredSlot.findFirst({
      where: { listingId: listing.id, endDate: { gt: new Date() } },
    });
    if (existingActive) {
      return NextResponse.json(
        {
          error: `Esta propiedad ya está destacada hasta el ${existingActive.endDate.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
          })}.`,
        },
        { status: 400 }
      );
    }

    const activeCount = await countActiveFeaturedSlots();
    if (activeCount >= FEATURED_MAX_ACTIVE_SLOTS) {
      return NextResponse.json(
        {
          error:
            "No hay espacios disponibles en Colecciones Destacadas esta semana — vuelve a intentarlo cuando se libere un cupo.",
        },
        { status: 400 }
      );
    }

    // Solo es "gratis" cuando lo agrega un admin para una propiedad que NO
    // es suya. Si un admin destaca su propia propiedad, paga como
    // cualquiera — así el reporte de ingresos no tiene un hueco raro sin
    // explicación.
    const isComplimentary = isAdmin && !isOwner;
    const breakdown = isComplimentary
      ? { grossAmount: 0, stripeFeeAmount: 0, platformFeeAmount: 0, estimatedTaxAmount: 0, netAmount: 0 }
      : calculateRentalEarnings(FEATURED_WEEKLY_PRICE_MXN);

    const startDate = new Date();
    const slot = await prisma.featuredSlot.create({
      data: {
        listingId: listing.id,
        startDate,
        endDate: featuredEndDate(startDate),
        isComplimentary,
        grossAmount: breakdown.grossAmount,
        stripeFeeAmount: breakdown.stripeFeeAmount,
        platformFeeAmount: breakdown.platformFeeAmount,
        estimatedTaxAmount: breakdown.estimatedTaxAmount,
        netAmount: breakdown.netAmount,
        addedByUserId: session.user.id,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (err) {
    console.error("Error al destacar la propiedad:", err);
    return NextResponse.json(
      {
        error: `No se pudo destacar la propiedad: ${err instanceof Error ? err.message : "error desconocido"}`,
      },
      { status: 500 }
    );
  }
}
