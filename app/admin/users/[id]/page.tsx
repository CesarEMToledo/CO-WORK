import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AssignPropertyForm } from "@/components/admin/AssignPropertyForm";
import { UnassignButton } from "@/components/admin/UnassignButton";
import { prisma } from "@/lib/prisma";

const ROLE_LABEL: Record<string, string> = {
  client: "Cliente",
  agent: "Agente",
  broker: "Broker",
  admin: "Administrador",
};

const RESERVATION_STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, include: { site: true } });
  if (!user) notFound();

  const isClient = user.role === "client";
  const isAgentLike = user.role === "agent" || user.role === "broker";

  const reservations = isClient
    ? await prisma.reservation.findMany({
        where: { userId: id },
        include: { property: { select: { name: true, type: true } } },
        orderBy: { startAt: "desc" },
      })
    : [];

  const assignments = isAgentLike
    ? await prisma.propertyAssignment.findMany({
        where: { agentId: id },
        include: { property: true },
        orderBy: { assignedAt: "desc" },
      })
    : [];

  const unassignedProperties = isAgentLike
    ? await prisma.property.findMany({
        where: { siteId: user.siteId, assignments: { none: { agentId: id } } },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const now = new Date();

  return (
    <>
      <Navbar />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-6">
          <ArrowLeft size={16} /> Volver al panel
        </Link>

        <div className="bg-white rounded-lg shadow-card p-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-on-surface">{user.name}</h1>
              <p className="text-on-surface-variant text-sm">{user.email}</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sahara-container text-on-surface">
              {ROLE_LABEL[user.role]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {user.site.name}</span>
            {user.role === "admin" && (
              <span className="flex items-center gap-1.5"><Building2 size={14} /> Nivel: {user.accessLevel === "global" ? "Global" : "Sede"}</span>
            )}
          </div>
        </div>

        {isClient && (
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4">Historial de reservas</h2>
            {reservations.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Este cliente no tiene reservas.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => {
                  const scope = r.endAt < now ? "Pasada" : r.startAt > now ? "Futura" : "Activa";
                  return (
                    <div key={r.id} className="bg-white rounded-lg shadow-card p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-on-surface text-sm">{r.property.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(r.startAt)} → {formatDate(r.endAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-bold text-primary">{scope}</span>
                        <span className="text-xs text-on-surface-variant">{RESERVATION_STATUS_LABEL[r.status]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {isAgentLike && (
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4">Propiedades asignadas</h2>
            {assignments.length === 0 ? (
              <p className="text-sm text-on-surface-variant mb-4">Sin propiedades asignadas todavía.</p>
            ) : (
              <div className="space-y-2 mb-6">
                {assignments.map((a) => (
                  <div key={a.id} className="bg-white rounded-lg shadow-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-on-surface text-sm">{a.property.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {a.property.type === "office" ? "Oficina" : "Sala de juntas"} · capacidad {a.property.capacity}
                      </p>
                    </div>
                    <UnassignButton agentId={id} propertyId={a.propertyId} />
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-sm font-bold text-on-surface mb-2">Asignar nueva propiedad</h3>
            <AssignPropertyForm agentId={id} options={unassignedProperties} />
          </section>
        )}

        {user.role === "admin" && (
          <p className="text-sm text-on-surface-variant">
            Los administradores tienen acceso total a la plataforma según su nivel de acceso.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
