import Link from "next/link";
import { DollarSign, Building2, Users, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const REPORTS = [
  {
    name: "Finanzas",
    description: "Ingresos por reservas, ticket promedio y desglose por tipo de tarifa.",
    href: "/admin/reportes/finanzas",
    icon: DollarSign,
  },
  {
    name: "Propiedades",
    description: "Ocupación, reservas e ingresos generados por oficina y sala de juntas.",
    href: "/admin/reportes/propiedades",
    icon: Building2,
  },
  {
    name: "Usuarios",
    description: "Altas recientes, estado de cuentas y actividad de clientes y agentes.",
    href: "/admin/reportes/usuarios",
    icon: Users,
  },
];

export default function ReportesPage() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Panel de Reportes</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Selecciona una categoría para visualizar los datos analíticos de la plataforma.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <Link
                key={report.href}
                href={report.href}
                className="group flex items-start gap-4 p-6 bg-white rounded-lg shadow-card hover:shadow-soft transition-shadow"
              >
                <span className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <div className="flex-1">
                  <h2 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                    {report.name}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">{report.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-3 group-hover:underline">
                    Ver reporte <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
