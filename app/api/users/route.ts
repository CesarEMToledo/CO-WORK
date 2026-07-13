import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { getMetricsForUser } from "@/lib/user-metrics";
import type { Prisma, Role } from "@/lib/generated/prisma/client";

const VALID_ROLES: Role[] = ["client", "agent", "broker", "admin"];

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 5) || 5));

  const where: Prisma.UserWhereInput = {};
  if (role && role !== "all" && VALID_ROLES.includes(role as Role)) {
    where.role = role as Role;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { site: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const data = await Promise.all(
    users.map(async (u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      site: u.site.name,
      metrics: await getMetricsForUser(u),
    }))
  );

  return NextResponse.json({ data, page, pageSize, total });
}
