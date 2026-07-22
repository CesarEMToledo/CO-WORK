"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Site {
  id: string;
  name: string;
}

export function RegisterForm({ sites }: { sites: Site[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      // Guardamos el nombre y la sede elegida en user_metadata: si tu
      // proyecto requiere confirmar el correo, /auth/callback los lee de ahí
      // para crear el perfil cuando el usuario confirme.
      options: { data: { name, siteId } },
    });

    if (signUpError) {
      setError(signUpError.message || "No se pudo completar el registro");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    });

    setLoading(false);

    if (res.status === 202) {
      // No hay sesión todavía: el proyecto exige confirmar el correo.
      setPendingConfirmation(true);
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No se pudo completar el registro");
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setPendingConfirmation(true);
    }
  };

  if (pendingConfirmation) {
    return (
      <div className="text-center space-y-3">
        <p className="text-on-surface font-bold">Revisa tu correo</p>
        <p className="text-sm text-on-surface-variant">
          Te enviamos un enlace de confirmación a <span className="font-semibold">{email}</span>. Ábrelo
          para activar tu cuenta.
        </p>
        <Link href="/login" className="text-primary font-bold underline underline-offset-2 text-sm">
          Volver a inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-on-surface mb-1.5">Nombre completo</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
        />
        <p className="text-xs text-on-surface-variant mt-1">Mínimo 8 caracteres.</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-on-surface mb-1.5">Sede</label>
        <select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-sm text-on-surface-variant text-center">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary font-bold underline underline-offset-2">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
