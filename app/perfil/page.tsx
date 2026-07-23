import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/current-user";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ProfileForm } from "@/components/ProfileForm";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/perfil");

  return (
    <>
      <Navbar />
      <main className="w-full max-w-lg mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Mi perfil</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Actualiza tu información personal y tu contraseña.
        </p>

        <Link
          href="/perfil/propiedades"
          className="flex items-center justify-between gap-3 bg-white rounded-lg shadow-card p-4 mb-8 hover:bg-sahara-container/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">Mis propiedades</p>
              <p className="text-xs text-on-surface-variant">
                Edita tus anuncios, revisa interesados y tus ganancias por renta
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-on-surface-variant shrink-0" />
        </Link>

        <ProfileForm
          user={{ name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl }}
        />
      </main>
      <Footer />
    </>
  );
}
