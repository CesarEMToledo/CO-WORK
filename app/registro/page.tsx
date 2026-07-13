import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { RegisterForm } from "@/components/RegisterForm";
import { prisma } from "@/lib/prisma";

export default async function RegistroPage() {
  const sites = await prisma.site.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <>
      <Navbar />
      <main className="w-full max-w-md mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Crea tu cuenta</h1>
        <p className="text-on-surface-variant text-sm mb-8">Únete a la comunidad de CO-WORK.</p>
        <RegisterForm sites={sites} />
      </main>
      <Footer />
    </>
  );
}
