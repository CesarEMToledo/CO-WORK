import Link from "next/link";
import { ArrowLeft, Wrench, PaintRoller, Wifi, MoreHorizontal, ImageIcon } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { IssueStatusSelect } from "@/components/admin/IssueStatusSelect";
import { prisma } from "@/lib/prisma";
import type { IssueCategory, IssueStatus, Prisma } from "@/lib/generated/prisma/client";

const STATUS_FILTERS: { id: IssueStatus | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "open", label: "Abiertas" },
  { id: "in_progress", label: "En progreso" },
  { id: "resolved", label: "Resueltas" },
];

const STATUS_STYLE: Record<IssueStatus, { label: string; dot: string; text: string }> = {
  open: { label: "Abierto", dot: "bg-red-500", text: "text-red-700" },
  in_progress: { label: "En progreso", dot: "bg-amber-500", text: "text-amber-700" },
  resolved: { label: "Resuelto", dot: "bg-emerald-500", text: "text-emerald-700" },
};

const CATEGORY_META: Record<IssueCategory, { label: string; icon: typeof Wrench }> = {
  maintenance: { label: "Mantenimiento", icon: Wrench },
  cleaning: { label: "Limpieza", icon: PaintRoller },
  internet: { label: "Internet", icon: Wifi },
  other: { label: "Otro", icon: MoreHorizontal },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function IncidenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = (sp.status ?? "all") as IssueStatus | "all";

  const where: Prisma.IssueReportWhereInput = statusFilter !== "all" ? { status: statusFilter } : {};

  const issues = await prisma.issueReport.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      reservation: { include: { property: { select: { name: true, site: { select: { name: true } } } } } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-6">
          <ArrowLeft size={16} /> Volver al panel
        </Link>

        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Incidencias reportadas</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Reportes de problemas enviados por clientes sobre sus reservas.
        </p>

        <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/incidencias?status=${f.id}`}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                statusFilter === f.id ? "bg-on-surface text-white" : "bg-white border border-outline/20 text-on-surface-variant hover:text-primary"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {issues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-8 text-center text-on-surface-variant">
            Sin incidencias para este filtro.
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => {
              const statusStyle = STATUS_STYLE[issue.status];
              const category = CATEGORY_META[issue.category];
              const CategoryIcon = category.icon;
              return (
                <div key={issue.id} className="bg-white rounded-lg shadow-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CategoryIcon size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-on-surface">{category.label}</p>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${statusStyle.text}`}>
                            <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {issue.reservation.property.name} · {issue.reservation.property.site.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {issue.user.name} ({issue.user.email}) · {formatDate(issue.createdAt)}
                        </p>
                      </div>
                    </div>
                    <IssueStatusSelect issueId={issue.id} status={issue.status} />
                  </div>
                  <p className="text-sm text-on-surface-variant mt-3">{issue.description}</p>
                  {issue.photos.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-on-surface-variant">
                      <ImageIcon size={14} /> {issue.photos.length} foto{issue.photos.length > 1 ? "s" : ""} adjunta{issue.photos.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
