import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { syncProfile } from "@/lib/sync-profile";

// Reemplaza al antiguo `auth()` de NextAuth. Junta la identidad de Supabase
// (cookies de sesión) con el perfil de la app en Postgres (rol, sede, etc.).
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let profile = await prisma.user.findUnique({ where: { authId: user.id } });

  if (!profile) {
    // Sesión válida en Supabase pero sin perfil todavía en nuestra base —
    // pasa cuando el registro quedó a medias (p. ej. confirmó su correo o
    // entró con Google pero /auth/callback no alcanzó a crear el perfil).
    // Antes esto mandaba a esa cuenta al login para siempre sin arreglo
    // posible; ahora, en vez de rendirnos, la sincronizamos aquí mismo la
    // primera vez que hace falta.
    const name =
      (user.user_metadata?.name as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Usuario";
    const siteId = (user.user_metadata?.siteId as string | undefined) ?? null;

    try {
      profile = await syncProfile({ authId: user.id, email: user.email ?? "", name, siteId });
    } catch (err) {
      console.error("No se pudo autosincronizar el perfil de", user.email, "->", err);
      return null;
    }
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
