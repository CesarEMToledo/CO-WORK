import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/sync-profile";

// Punto de retorno para: confirmación de correo (registro con
// email/contraseña) y OAuth (Google, Apple). Supabase redirige aquí con un
// `code` que canjeamos por una sesión; si es la primera vez que este usuario
// entra, creamos su perfil en nuestra tabla User.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const callbackUrl = url.searchParams.get("callbackUrl") ?? "/";
  const redirectTo = new URL(callbackUrl, url.origin);

  if (!code) {
    redirectTo.pathname = "/login";
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  const user = data.user;
  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Usuario";
  const siteId = (user.user_metadata?.siteId as string | undefined) ?? null;

  try {
    await syncProfile({ authId: user.id, email: user.email ?? "", name, siteId });
  } catch (err) {
    console.error("No se pudo crear/sincronizar el perfil tras el login:", err);
  }

  return NextResponse.redirect(redirectTo);
}
