import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renombró "middleware" a "proxy" (mismo comportamiento). Protege
// /admin (solo rol admin), /reportes y /perfil (cualquier usuario
// autenticado), igual que antes con NextAuth, pero ahora usando la sesión de
// Supabase.
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isReportesRoute = pathname.startsWith("/reportes");
  const isPerfilRoute = pathname.startsWith("/perfil");

  if ((isAdminRoute || isReportesRoute || isPerfilRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // El rol vive en app_metadata (lo sincronizamos ahí al crear/editar
  // usuarios) para poder autorizar aquí sin consultar la base de datos.
  if (isAdminRoute && user?.app_metadata?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/reportes/:path*", "/perfil/:path*"],
};
