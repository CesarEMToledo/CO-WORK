"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function UnassignButton({ agentId, propertyId }: { agentId: string; propertyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnassign = async () => {
    setLoading(true);
    await fetch(`/api/properties/${propertyId}/assign`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleUnassign}
      disabled={loading}
      aria-label="Quitar asignación"
      className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <X size={14} />
    </button>
  );
}
