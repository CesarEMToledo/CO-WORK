import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Cliente de Supabase para usar en Server Components, Route Handlers y Server
// Actions. Lee/escribe la sesión a través de las cookies de Next.js.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Se llamó desde un Server Component (no puede escribir cookies).
          // El proxy (proxy.ts) ya se encarga de refrescar la sesión en cada
          // request, así que esto es seguro de ignorar.
        }
      },
    },
  });
}
