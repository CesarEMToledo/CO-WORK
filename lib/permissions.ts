import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { session: null, error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session, error: null as null };
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  return { session, error: null as null };
}

export async function requireAdminOrSelf(userId: string) {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (session.user.role !== "admin" && session.user.id !== userId) {
    return { session: null, error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session, error: null as null };
}
