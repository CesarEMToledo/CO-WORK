import { auth } from "@/auth";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ReportIssueForm } from "@/components/ReportIssueForm";
import { prisma } from "@/lib/prisma";

export default async function ReportarProblemaPage() {
  const session = await auth();
  const userId = session!.user.id;

  const reservations = await prisma.reservation.findMany({
    where: { userId, status: { in: ["pending", "confirmed"] } },
    include: { property: { select: { name: true, site: { select: { name: true } } } } },
    orderBy: { startAt: "desc" },
  });

  const options = reservations.map((r) => ({
    id: r.id,
    label: `${r.property.name} · ${r.property.site.name}`,
  }));

  return (
    <>
      <Navbar />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-xs font-bold text-on-surface-variant mb-2">
          Escritorio <span className="mx-1">›</span> <span className="text-on-surface">Soporte al Cliente</span>
        </p>
        <h1 className="text-3xl font-extrabold text-on-surface mb-2">Reportar Problema</h1>
        <p className="text-on-surface-variant text-sm max-w-2xl mb-8">
          Sentimos que estés teniendo inconvenientes. Por favor, detalla el problema a continuación para que
          nuestro equipo de mantenimiento pueda resolverlo de inmediato.
        </p>

        <ReportIssueForm reservations={options} />
      </main>
      <Footer />
    </>
  );
}
