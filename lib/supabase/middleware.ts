import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Basado en el patrón oficial de Supabase para Next.js 16 (proxy.ts).
// Refresca el token de sesión en cada request y devuelve tanto la respuesta
// (con las cookies ya actualizadas) como el usuario autenticado, si existe.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Importante: usamos getUser() (revalida el token contra Supabase) y NO
  // getSession() (solo lee la cookie sin verificarla) — así el proxy no se
  // puede engañar con una cookie manipulada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
