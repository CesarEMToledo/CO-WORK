// Supabase renombró la "anon key" a "publishable key" en su nuevo sistema de
// API keys, pero muchos proyectos existentes todavía la muestran como "anon".
// Aceptamos ambos nombres de variable para que funcione sin importar cuál
// tenga tu proyecto en Project Settings -> API.
export function supabasePublishableKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY) en tus variables de entorno."
    );
  }
  return key;
}

export function supabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en tus variables de entorno.");
  }
  return url;
}
