import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { prisma } from "@/lib/prisma";
import { getMetricsForUser } from "@/lib/user-metrics";
import type { Prisma, Role, UserStatus } from "@/lib/generated/prisma/client";

const PAGE_SIZE = 5;

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
  active: { label: "Activo", dot: "bg-success", text: "text-success" },
  inactive: { label: "Inactivo", dot: "bg-outline", text: "text-on-surface-variant" },
  away: { label: "Ausente", dot: "bg-warning", text: "text-warning" },
};

function formatDate(value: Date | null) {
  if (!value) return "—";
  return value.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function Metrics({ role, metrics }: { role: Role; metrics: Awaited<ReturnType<typeof getMetricsForUser>> }) {
  if (role === "client") {
    return (
      <div className="flex flex-col gap-0.5 text-xs">
        <span className="font-semibold text-on-surface">{String(metrics.activeReservations)} reservas activas</span>
        <span className="text-on-surface-variant">Último acceso: {formatDate(metrics.lastLogin as Date | null)}</span>
      </div>
    );
  }
  if (role === "agent" || role === "broker") {
    return (
      <div className="flex flex-col gap-0.5 text-xs">
        <span className="font-semibold text-on-surface">{String(metrics.assignedProperties)} propiedades asignadas</span>
        <span className="text-on-surface-variant">{String(metrics.reservationsYTD)} reservas gestionadas (YTD)</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-semibold text-on-surface">{String(metrics.properties)} propiedades</span>
      <span className="text-on-surface-variant">Nivel: {metrics.accessLevel === "global" ? "Global" : "Sede"}</span>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const role = (sp.role ?? "all") as Role | "all";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: Prisma.UserWhereInput = role !== "all" ? { role } : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { site: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const rows = await Promise.all(
    users.map(async (u) => ({ ...u, metrics: await getMetricsForUser(u) }))
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Administración de usuarios</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Gestiona clientes, agentes, brokers y administradores de la plataforma.
        </p>

        <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 mb-6">
          {ROLE_FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin?role=${f.id}`}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                role === f.id ? "bg-on-surface text-white" : "bg-white border border-outline/20 text-on-surface-variant hover:text-primary"
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
                <th className="px-4 py-3 font-bold">Métricas</th>
                <th className="px-4 py-3 font-bold text-right">Acciones</th>
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
                    <tr key={user.id} className="border-b border-outline/10 last:border-0 align-top">
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
                      <td className="px-4 py-3">
                        <Metrics role={user.role} metrics={user.metrics} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-2">
                          <RoleSelect userId={user.id} role={user.role} />
                          <StatusToggle userId={user.id} status={user.status} name={user.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-on-surface-variant">
          <span>Mostrando {rows.length} de {total}</span>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin?role=${role}&page=${Math.max(1, page - 1)}`}
              aria-disabled={page === 1}
              className={`p-2 rounded-lg border border-outline/20 hover:bg-sahara-container ${page === 1 ? "pointer-events-none opacity-60 cursor-not-allowed" : ""}`}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </Link>
            <span className="text-xs font-bold">{page} / {totalPages}</span>
            <Link
              href={`/admin?role=${role}&page=${Math.min(totalPages, page + 1)}`}
              aria-disabled={page >= totalPages}
              className={`p-2 rounded-lg border border-outline/20 hover:bg-sahara-container ${page >= totalPages ? "pointer-events-none opacity-60 cursor-not-allowed" : ""}`}
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
