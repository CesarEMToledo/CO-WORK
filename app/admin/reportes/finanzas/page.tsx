import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { prisma } from "@/lib/prisma";
import type { Prisma, ReservationStatus } from "@/lib/generated/prisma/client";

const STATUS_FILTERS: { id: ReservationStatus | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "confirmed", label: "Confirmadas" },
  { id: "completed", label: "Completadas" },
  { id: "pending", label: "Pendientes" },
  { id: "cancelled", label: "Canceladas" },
];

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const STATUS_STYLE: Record<ReservationStatus, string> = {
  pending: "text-warning",
  confirmed: "text-success",
  completed: "text-success",
  cancelled: "text-error",
};

const RATE_TYPE_LABEL: Record<string, string> = {
  hourly: "Por hora",
  daily: "Por día",
  monthly: "Mensual",
};

function formatCurrency(value: number) {
  return value.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

const REVENUE_STATUSES: ReservationStatus[] = ["confirmed", "completed"];

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = (sp.status ?? "all") as ReservationStatus | "all";

  const revenueAgg = await prisma.reservation.aggregate({
    where: { status: { in: REVENUE_STATUSES } },
    _sum: { totalPrice: true },
    _avg: { totalPrice: true },
    _count: true,
  });

  const byRateType = await prisma.reservation.groupBy({
    by: ["rateType"],
    where: { status: { in: REVENUE_STATUSES } },
    _sum: { totalPrice: true },
    _count: true,
  });

  const where: Prisma.ReservationWhereInput = statusFilter !== "all" ? { status: statusFilter } : {};
  const reservations = await prisma.reservation.findMany({
    where,
    include: { property: { select: { name: true, siteId: true, site: { select: { name: true } } } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const totalIngresos = Number(revenueAgg._sum.totalPrice ?? 0);
  const ticketPromedio = Number(revenueAgg._avg.totalPrice ?? 0);

  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin/reportes" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-6">
          <ArrowLeft size={16} /> Volver a reportes
        </Link>

        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Reporte Financiero</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Ingresos generados por reservas confirmadas y completadas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Ingresos totales</div>
            <div className="text-2xl font-extrabold text-on-surface">{formatCurrency(totalIngresos)}</div>
            <div className="text-xs text-on-surface-variant/70 mt-1">Reservas confirmadas y completadas</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Reservas facturadas</div>
            <div className="text-2xl font-extrabold text-on-surface">{revenueAgg._count}</div>
            <div className="text-xs text-on-surface-variant/70 mt-1">Total de reservas con ingreso</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-card">
            <div className="text-sm font-medium text-on-surface-variant mb-1">Ticket promedio</div>
            <div className="text-2xl font-extrabold text-on-surface">{formatCurrency(ticketPromedio)}</div>
            <div className="text-xs text-on-surface-variant/70 mt-1">Por reserva</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6 mb-8">
          <h2 className="font-bold text-on-surface mb-4">Ingresos por tipo de tarifa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {byRateType.map((r) => (
              <div key={r.rateType} className="p-4 bg-sahara-container/60 rounded-lg">
                <div className="text-xs font-bold text-on-surface-variant uppercase">{RATE_TYPE_LABEL[r.rateType]}</div>
                <div className="text-lg font-extrabold text-on-surface mt-1">{formatCurrency(Number(r._sum.totalPrice ?? 0))}</div>
                <div className="text-xs text-on-surface-variant/70">{r._count} reservas</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 mb-4">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/reportes/finanzas?status=${f.id}`}
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
                <th className="px-4 py-3 font-bold">Cliente</th>
                <th className="px-4 py-3 font-bold">Tarifa</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 font-bold">Fecha</th>
                <th className="px-4 py-3 font-bold text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                    Sin reservas para este filtro.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="border-b border-outline/10 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-bold text-on-surface">{r.property.name}</div>
                      <div className="text-xs text-on-surface-variant">{r.property.site.name}</div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.user.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{RATE_TYPE_LABEL[r.rateType]}</td>
                    <td className={`px-4 py-3 font-bold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-bold text-on-surface">{formatCurrency(Number(r.totalPrice))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
