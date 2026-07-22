import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { setUserRoleClaim } from "@/lib/supabase/admin";

const bodySchema = z.object({
  role: z.enum(["client", "agent", "broker", "admin"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role: parsed.data.role,
      accessLevel: parsed.data.role === "admin" ? (user.accessLevel ?? "site") : null,
    },
  });

  try {
    await setUserRoleClaim(updated.authId, updated.role);
  } catch (err) {
    // El perfil ya quedó actualizado; si esto falla, el usuario seguirá
    // viendo su rol anterior en el proxy hasta que se sincronice a mano.
    console.error("No se pudo sincronizar app_metadata.role con Supabase:", err);
  }

  return NextResponse.json({ id: updated.id, role: updated.role });
}
