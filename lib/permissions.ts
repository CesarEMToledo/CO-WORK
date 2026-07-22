import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUser } from "@/lib/current-user";

type Result =
  | { session: { user: CurrentUser }; error: null }
  | { session: null; error: ReturnType<typeof NextResponse.json> };

export async function requireAdmin(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { session: null, error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session: { user }, error: null };
}

export async function requireSession(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) {
    return { session: null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  return { session: { user }, error: null };
}

export async function requireAdminOrSelf(userId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) {
    return { session: null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (user.role !== "admin" && user.id !== userId) {
    return { session: null, error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session: { user }, error: null };
}
