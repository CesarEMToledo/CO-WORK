"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "client" | "agent" | "broker" | "admin";

const ROLE_LABEL: Record<Role, string> = {
  client: "Cliente",
  agent: "Agente",
  broker: "Broker",
  admin: "Administrador",
};

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (newRole: Role) => {
    setLoading(true);
    await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <select
      value={role}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as Role)}
      aria-label="Cambiar rol de usuario"
      className="text-xs font-bold border border-outline/20 rounded-lg px-2 py-1.5 bg-white disabled:opacity-60 focus:ring-2 focus:ring-primary outline-none"
    >
      {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
        <option key={r} value={r}>{ROLE_LABEL[r]}</option>
      ))}
    </select>
  );
}
