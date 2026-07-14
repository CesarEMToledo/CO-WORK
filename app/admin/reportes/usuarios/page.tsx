import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { prisma } from "@/lib/prisma";
import { getMetricsForUser } from "@/lib/user-metrics";
import type { Prisma, Role, UserStatus } from "@/lib/generated/prisma/client";

const ROLE_FILTERS: { id: Role | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "client", label: "Clientes" },
  { id: "agent", label: "Agentes" },
  { id: "broker", label: "Brokers" },
  { id: "admin", label: "Administradores" },
];

const ROLE_LABEL: Record<Role, string> = {
  client: "Cliente",
  agent: "Agente",
  broker: "Broker",
  admin: "Administrador",
};

const STATUS_STYLE: Record<UserStatus, { label: string; dot: string; text: string }> = {
  active: { label: "Activo", dot: "bg-emerald-500", text: "text-emerald-700" },
  inactive: { label: "Inactivo", dot: "bg-gray-400", text: "text-gray-600" },
  away: { label: "Ausente", dot: "bg-amber-500", text: "text-amber-700" },
};

function formatDate(value: Date | null) {
  if (!value) return "Nunca";
  return value.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function ActivitySummary({ role, metrics }: { role: Role; metrics: Awaited<ReturnType<typeof getMetricsForUser>> }) {
  if (role === "client") {
    return <span className="text-on-surface-variant">{String(metrics.activeReservations)} reservas activas</span>;
  }
  if (role === "agent" || role === "broker") {
    return <span className="text-on-surface-variant">{String(metrics.assignedProperties)} propiedades asignadas</span>;
  }
  return <span className="text-on-surface-variant">{String(metrics.properties)} propiedades bajo gestión</span>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function UsuariosReportPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const roleFilter = (sp.role ?? "all") as Role | "all";

  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * DAY_MS);
  const last7Days = new Date(now.getTime() - 7 * DAY_MS);

  const where: Prisma.UserWhereInput = roleFilter !== "all" ? { role: roleFilter } : {};

  const [activeCount, newUsers30d, reservations7d, users] = await Promise.all([
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.reservation.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.user.findMany({
      where,
      include: { site: { select: { name: true } } },
      orderBy: { lastLoginAt: { sort: "desc", nulls: "last" } },
      take: 25,
    }),
  ]);

  const rows = await Promise.all(users.map(async (u) => ({ ...u, metrics: await getMetricsForUser(u) })));

  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin/reportes" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-6">
          <ArrowLeft size={16} /> Volver a reportes
        </Link>

        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Actividad de Usuarios</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Altas recientes, estado de cuentas y actividad de clientes, agentes y brokers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Usuarios activos</div>
            <div className="text-2xl font-extrabold text-on-surface">{activeCount}</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Altas (últimos 30 días)</div>
            <div className="text-2xl font-extrabold text-on-surface">{newUsers30d}</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Reservas (últimos 7 días)</div>
            <div className="text-2xl font-extrabold text-on-surface">{reservations7d}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 mb-4">
          {ROLE_FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/reportes/usuarios?role=${f.id}`}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                roleFilter === f.id ? "bg-on-surface text-white" : "bg-white border border-outline/20 text-on-surface-variant hover:text-primary"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-outline/10 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                <th className="px-4 py-3 font-bold">Usuario</th>
                <th className="px-4 py-3 font-bold">Rol</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 font-bold">Actividad</th>
                <th className="px-4 py-3 font-bold">Último acceso</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                    Sin usuarios para este filtro.
                  </td>
                </tr>
              ) : (
                rows.map((user) => {
                  const statusStyle = STATUS_STYLE[user.status];
                  return (
                    <tr key={user.id} className="border-b border-outline/10 last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${user.id}`} className="font-bold text-on-surface hover:text-primary">
                          {user.name}
                        </Link>
                        <div className="text-xs text-on-surface-variant">{user.email}</div>
                        <div className="text-xs text-on-surface-variant/70">{user.site.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-sahara-container text-on-surface">
                          {ROLE_LABEL[user.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${statusStyle.text}`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <ActivitySummary role={user.role} metrics={user.metrics} />
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{formatDate(user.lastLoginAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
