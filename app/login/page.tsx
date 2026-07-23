"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.47c-.28 1.48-1.13 2.74-2.41 3.58v2.98h3.89c2.28-2.1 3.57-5.2 3.57-8.74z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.95-2.9l-3.89-2.98c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.1-6.71-4.93H1.28v3.09C3.26 21.3 7.29 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.34A7.14 7.14 0 0 1 4.9 12c0-.81.14-1.6.39-2.34V6.57H1.28A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.28 5.43z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.44-3.44C17.94 1.19 15.24 0 12 0 7.29 0 3.26 2.7 1.28 6.57l4.01 3.09C6.23 6.85 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("callbackUrl", callbackUrl);

    const { error: oauthSignInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });

    if (oauthSignInError) {
      setOauthLoading(false);
      setError("No se pudo iniciar sesión con Google.");
    }
    // Si todo salió bien, el navegador es redirigido a Google y luego de
    // vuelta a /auth/callback — no hay nada más que hacer aquí.
  };

  return (
    <main className="w-full max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-on-surface mb-1">Iniciar sesión</h1>
      <p className="text-on-surface-variant text-sm mb-8">Accede a tu cuenta de CO-WORK.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Contraseña</label>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {(error || oauthError) && (
          <p className="text-sm font-medium text-red-600">
            {error || "No se pudo completar el inicio de sesión. Intenta de nuevo."}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-outline/20 flex-1" />
        <span className="text-xs font-bold text-on-surface-variant">O continúa con</span>
        <div className="h-px bg-outline/20 flex-1" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={oauthLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-outline/20 rounded-lg font-bold text-sm text-on-surface hover:bg-sahara-container disabled:opacity-60 transition-colors"
      >
        <GoogleIcon />
        {oauthLoading ? "Conectando..." : "Continuar con Google"}
      </button>

      <p className="text-sm text-on-surface-variant mt-6 text-center">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-primary font-bold underline underline-offset-2">
          Regístrate
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
