"use client";

import { Suspense, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (result?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
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
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

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
