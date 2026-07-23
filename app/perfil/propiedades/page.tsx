import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { MisPropiedades } from "@/components/MisPropiedades";

export default async function MisPropiedadesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/perfil/propiedades");

  return (
    <>
      <Navbar />
      <main className="w-full max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Mis propiedades</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Administra las propiedades que has publicado, revisa quién se ha interesado, registra tus rentas y
          consulta tus ganancias.
        </p>
        <MisPropiedades />
      </main>
      <Footer />
    </>
  );
}
