import { prisma } from "@/lib/prisma";

/**
 * "Colecciones Destacadas" del inicio — cupo semanal pagado (ver
 * prisma/schema.prisma, modelo FeaturedSlot). Constantes compartidas por
 * app/api/featured/route.ts, app/api/admin/featured/route.ts y la UI.
 */
export const FEATURED_WEEKLY_PRICE_MXN = 50;
export const FEATURED_MAX_ACTIVE_SLOTS = 6;
export const FEATURED_DURATION_DAYS = 7;

export function featuredEndDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

/** Cupos "vivos" ahora mismo — endDate en el futuro. */
export async function countActiveFeaturedSlots(): Promise<number> {
  return prisma.featuredSlot.count({ where: { endDate: { gt: new Date() } } });
}
