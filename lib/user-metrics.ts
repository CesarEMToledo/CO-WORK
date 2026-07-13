import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma/client";

export async function getMetricsForUser(user: User) {
  if (user.role === "client") {
    const activeReservations = await prisma.reservation.count({
      where: {
        userId: user.id,
        status: { in: ["confirmed", "pending"] },
        endAt: { gte: new Date() },
      },
    });
    return { activeReservations, lastLogin: user.lastLoginAt };
  }

  if (user.role === "agent" || user.role === "broker") {
    const assignedProperties = await prisma.propertyAssignment.count({
      where: { agentId: user.id },
    });
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const reservationsYTD = await prisma.reservation.count({
      where: {
        createdAt: { gte: yearStart },
        property: { assignments: { some: { agentId: user.id } } },
      },
    });
    return { assignedProperties, reservationsYTD };
  }

  // admin
  const properties =
    user.accessLevel === "global"
      ? await prisma.property.count()
      : await prisma.property.count({ where: { siteId: user.siteId } });
  return { properties, accessLevel: user.accessLevel };
}
