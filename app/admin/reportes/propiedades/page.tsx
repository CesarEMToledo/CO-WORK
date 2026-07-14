import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { prisma } from "@/lib/prisma";
import type { Prisma, PropertyStatus, PropertyType } from "@/lib/generated/prisma/client";

const STATUS_FILTERS: { id: PropertyStatus | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "available", label: "Disponibles" },
  { id: "maintenance", label: "En mantenimiento" },
  { id: "inactive", label: "Inactivas" },
];

const TYPE_LABEL: Record<PropertyType, string> = {
  office: "Oficina",
  meeting_room: "Sala de juntas",
};

const STATUS_LABEL: Record<PropertyStatus, string> = {
  available: "Disponible",
  maintenance: "Mantenimiento",
  inactive: "Inactiva",
};

const STATUS_STYLE: Record<PropertyStatus, { dot: string; text: string }> = {
  available: { dot: "bg-emerald-500", text: "text-emerald-700" },
  maintenance: { dot: "bg-amber-500", text: "text-amber-700" },
  inactive: { dot: "bg-gray-400", text: "text-gray-600" },
};

function formatCurrency(value: number) {
  return value.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

const REVENUE_STATUSES = ["confirmed", "completed"] as const;

export default async function PropiedadesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = (sp.status ?? "all") as PropertyStatus | "all";

  const where: Prisma.PropertyWhereInput = statusFilter !== "all" ? { status: statusFilter } : {};

  const [properties, statusCounts, revenueByProperty] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { site: { select: { name: true } }, _count: { select: { reservations: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.property.groupBy({ by: ["status"], _count: true }),
    prisma.reservation.groupBy({
      by: ["propertyId"],
      where: { status: { in: [...REVENUE_STATUSES] } },
      _sum: { totalPrice: true },
    }),
  ]);

  const revenueByPropertyId = new Map(revenueByProperty.map((r) => [r.propertyId, Number(r._sum.totalPrice ?? 0)]));
  const statusCountMap = new Map(statusCounts.map((s) => [s.status, s._count]));
  const totalIngresos = [...revenueByPropertyId.values()].reduce((sum, v) => sum + v, 0);

  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin/reportes" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-6">
          <ArrowLeft size={16} /> Volver a reportes
        </Link>

        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Rendimiento de Propiedades</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Ocupación, reservas e ingresos por oficina y sala de juntas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Total propiedades</div>
            <div className="text-2xl font-extrabold text-on-surface">
              {statusCounts.reduce((sum, s) => sum + s._count, 0)}
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Disponibles</div>
            <div className="text-2xl font-extrabold text-emerald-700">{statusCountMap.get("available") ?? 0}</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">En mantenimiento</div>
            <div className="text-2xl font-extrabold text-amber-700">{statusCountMap.get("maintenance") ?? 0}</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Ingresos generados</div>
            <div className="text-2xl font-extrabold text-on-surface">{formatCurrency(totalIngresos)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 mb-4">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/reportes/propiedades?status=${f.id}`}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === f.id ? "bg-on-surface text-white" : "bg-white border border-outline/20 text-on-surface-variant hover:text-primary"
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
                <th className="px-4 py-3 font-bold">Propiedad</th>
                <th className="px-4 py-3 font-bold">Tipo</th>
                <th className="px-4 py-3 font-bold">Sede</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 font-bold text-right">Reservas</th>
                <th className="px-4 py-3 font-bold text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                    Sin propiedades para este filtro.
                  </td>
                </tr>
              ) : (
                properties.map((p) => {
                  const statusStyle = STATUS_STYLE[p.status];
                  return (
                    <tr key={p.id} className="border-b border-outline/10 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-bold text-on-surface">{p.name}</div>
                        <div className="text-xs text-on-surface-variant">Capacidad {p.capacity}</div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{TYPE_LABEL[p.type]}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{p.site.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${statusStyle.text}`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-on-surface-variant">{p._count.reservations}</td>
                      <td className="px-4 py-3 text-right font-bold text-on-surface">
                        {formatCurrency(revenueByPropertyId.get(p.id) ?? 0)}
                      </td>
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
