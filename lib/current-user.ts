import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Reemplaza al antiguo `auth()` de NextAuth. Junta la identidad de Supabase
// (cookies de sesión) con el perfil de la app en Postgres (rol, sede, etc.).
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.user.findUnique({ where: { authId: user.id } });
  if (!profile) {
    // Sesión válida en Supabase pero sin perfil todavía en nuestra base
    // (caso raro: debería haberse creado en /auth/callback o al registrarse).
    return null;
  }

  return {
    id: profile.id,
    authId: user.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    siteId: profile.siteId,
  };
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
