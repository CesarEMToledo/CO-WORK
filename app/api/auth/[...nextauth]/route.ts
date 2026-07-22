// DEPRECADO: NextAuth ya no se usa (ver /auth.ts). Esta carpeta puede
// borrarse con seguridad; se deja un 404 explícito mientras tanto.
import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json({ error: "Este endpoint fue reemplazado por Supabase Auth." }, { status: 404 });
}

export const GET = gone;
export const POST = gone;
