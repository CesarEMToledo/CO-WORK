"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

// Cliente de Supabase para usar en Client Components (navegador).
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}
