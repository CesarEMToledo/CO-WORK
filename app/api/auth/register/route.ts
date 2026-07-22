import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/sync-profile";

const bodySchema = z.object({
  siteId: z.string().min(1, "Selecciona una sede"),
});

// Se llama justo después de `supabase.auth.signUp()` en el navegador. La
// contraseña ya la validó y guardó Supabase Auth; aquí solo creamos el
// perfil de la app (rol, sede) para el usuario que quedó autenticado en la
// sesión actual.
//
// Si tu proyecto de Supabase tiene activada la confirmación de correo, no
// habrá sesión todavía en este punto: el perfil se crea entonces en
// /auth/callback cuando el usuario confirme su correo (usamos la sede que
// guardamos en su user_metadata al hacer signUp).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const site = await prisma.site.findUnique({ where: { id: parsed.data.siteId } });
  if (!site) {
    return NextResponse.json({ error: "Sede inválida" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Confirmación de correo pendiente: el perfil se completará en el callback.
    return NextResponse.json({ pendingEmailConfirmation: true }, { status: 202 });
  }

  const name = (user.user_metadata?.name as string | undefined) ?? user.email?.split("@")[0] ?? "Usuario";

  const profile = await syncProfile({
    authId: user.id,
    email: user.email ?? "",
    name,
    siteId: site.id,
  });

  return NextResponse.json({ id: profile.id, email: profile.email }, { status: 201 });
}
