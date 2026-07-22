"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthState>({ user: null, status: "loading" });

// Antes envolvía a next-auth's <SessionProvider>. Ahora mantiene la sesión de
// Supabase sincronizada en el cliente (mismo nombre/ubicación para no tener
// que tocar app/layout.tsx). Usa useSupabaseUser() para leer el estado.
export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, status: "loading" });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setState({ user, status: user ? "authenticated" : "unauthenticated" });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, status: session?.user ? "authenticated" : "unauthenticated" });
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useSupabaseUser() {
  return useContext(AuthContext);
}
