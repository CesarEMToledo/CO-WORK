import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { FeaturedListingsPanel } from "@/components/admin/FeaturedListingsPanel";

export default async function DestacadosAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/destacados");
  if (user.role !== "admin") redirect("/");

  return (
    <>
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Colecciones Destacadas</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Propiedades con un cupo pagado (o agregado gratis) en el carrusel de inicio — máximo 6 a la vez, 7 días
          por cupo, $50 MXN/semana.
        </p>
        <FeaturedListingsPanel />
      </main>
      <Footer />
    </>
  );
}
