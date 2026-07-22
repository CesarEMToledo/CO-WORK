import { redirect } from "next/navigation";
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
        <ProfileForm
          user={{ name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl }}
        />
      </main>
      <Footer />
    </>
  );
}
