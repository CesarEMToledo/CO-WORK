import { prisma } from "@/lib/prisma";
import { setUserRoleClaim } from "@/lib/supabase/admin";
import type { Role } from "@/lib/generated/prisma/enums";

interface SyncProfileInput {
  authId: string;
  email: string;
  name: string;
  siteId?: string | null;
  role?: Role;
}

// Crea (o reutiliza) el perfil en nuestra tabla User a partir de una
// identidad de Supabase Auth. Se llama después de un registro por
// email/contraseña y desde /auth/callback para logins con Google/Apple.
export async function syncProfile({ authId, email, name, siteId, role = "client" }: SyncProfileInput) {
  const existingByAuthId = await prisma.user.findUnique({ where: { authId } });
  if (existingByAuthId) return existingByAuthId;

  // Si el correo ya existía (p. ej. viene del seed anterior a Supabase),
  // lo vinculamos a esta identidad en vez de duplicarlo.
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    return prisma.user.update({ where: { id: existingByEmail.id }, data: { authId } });
  }

  const site =
    (siteId ? await prisma.site.findUnique({ where: { id: siteId } }) : null) ??
    (await prisma.site.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!site) {
    throw new Error("No hay ninguna sede (Site) creada todavía; crea una antes de registrar usuarios.");
  }

  const created = await prisma.user.create({
    data: { authId, email, name, siteId: site.id, role },
  });

  try {
    await setUserRoleClaim(authId, created.role);
  } catch (err) {
    // No bloqueamos el registro si esto falla; el proxy simplemente tratará
    // al usuario como "client" hasta que se sincronice el claim.
    console.error("No se pudo sincronizar app_metadata.role con Supabase:", err);
  }

  return created;
}
