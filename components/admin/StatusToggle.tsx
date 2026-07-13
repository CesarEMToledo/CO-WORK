"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "active" | "inactive" | "away";

export function StatusToggle({ userId, status, name }: { userId: string; status: Status; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextStatus: Status = status === "active" ? "inactive" : "active";
    if (nextStatus === "inactive" && !window.confirm(`¿Suspender la cuenta de ${name}?`)) return;

    setLoading(true);
    await fetch(`/api/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-xs font-bold text-primary hover:underline disabled:opacity-60"
    >
      {status === "active" ? "Suspender" : "Activar"}
    </button>
  );
}
