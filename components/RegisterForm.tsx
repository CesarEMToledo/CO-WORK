"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "client" | "agent" | "broker" | "admin";

const ROLES: { id: Role; label: string; description: string }[] = [
  { id: "client", label: "Cliente", description: "Reservar oficinas y salas" },
  { id: "agent", label: "Agente", description: "Gestionar propiedades asignadas" },
  { id: "broker", label: "Broker", description: "Gestionar propiedades y reservas" },
  { id: "admin", label: "Administrador", description: "Acceso total a la plataforma" },
];

interface Site {
  id: string;
  name: string;
}

export function RegisterForm({ sites }: { sites: Site[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, siteId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo completar el registro");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInResult?.error) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  };

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
        <p className="text-xs text-on-surface-variant mt-1">
          Mínimo 8 caracteres, con al menos una mayúscula y un número.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-on-surface mb-2">Tipo de cuenta</label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`text-left px-4 py-3 rounded-lg border transition-all ${
                role === r.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-outline/20 bg-white hover:border-primary/40"
              }`}
            >
              <span className="block font-bold text-sm text-on-surface">{r.label}</span>
              <span className="block text-xs text-on-surface-variant mt-0.5">{r.description}</span>
            </button>
          ))}
        </div>
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
