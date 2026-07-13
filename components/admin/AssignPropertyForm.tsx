"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  name: string;
}

export function AssignPropertyForm({ agentId, options }: { agentId: string; options: Option[] }) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(options[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  if (options.length === 0) {
    return <p className="text-sm text-on-surface-variant">No hay propiedades disponibles para asignar.</p>;
  }

  const handleAssign = async () => {
    if (!propertyId) return;
    setLoading(true);
    await fetch(`/api/properties/${propertyId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <select
        value={propertyId}
        onChange={(e) => setPropertyId(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading}
        className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
      >
        {loading ? "Asignando..." : "Asignar"}
      </button>
    </div>
  );
}
