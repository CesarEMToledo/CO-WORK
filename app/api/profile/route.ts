import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";

const bodySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-\s]*$/, "Solo números, espacios y + ( ) -")
    .optional()
    .nullable(),
  avatarUrl: z.string().url().max(2048).optional().nullable(),
});

// Cualquier usuario autenticado edita SU PROPIO perfil aquí (nombre, teléfono,
// foto). Rol, sede y estado siguen siendo exclusivos del panel de admin
// (app/api/users/[id]/...), esta ruta no los toca.
export async function PATCH(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

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

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    avatarUrl: updated.avatarUrl,
  });
}
