import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

// Cliente con la Service Role Key: tiene permisos totales (bypassa RLS y
// puede crear/editar usuarios de Auth). SOLO se debe importar desde código
// que corre en el servidor (Route Handlers, scripts). Nunca lo expongas al
// navegador ni lo mandes en una respuesta.
//
// Nota: NO usamos el paquete "server-only" aquí a propósito — este archivo
// también lo importa prisma/seed.ts, que corre con tsx fuera de Next.js, y
// ese paquete lanza un error siempre que se carga fuera del bundler de
// Next.js (no solo en componentes de cliente).
let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en tus variables de entorno. Cópiala desde " +
        "Project Settings -> API -> service_role en tu dashboard de Supabase."
    );
  }

  cached = createSupabaseJsClient(supabaseUrl(), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

// Refleja el rol de la app dentro del app_metadata del usuario de Supabase
// Auth, para que quede disponible en el JWT (así el proxy puede autorizar
// /admin sin tener que consultar la base de datos en cada request).
export async function setUserRoleClaim(authId: string, role: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(authId, {
    app_metadata: { role },
  });
  if (error) throw error;
}
