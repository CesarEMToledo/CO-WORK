"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface FeatureListingButtonProps {
  listingId: string;
  featuredUntil: string | null;
  /** true cuando ya hay 6 cupos activos en el sitio — deshabilita el botón antes de intentar, sin esperar al error del servidor. */
  slotsFull: boolean;
  onFeatured: (featuredUntil: string) => void;
}

/**
 * Botón de "Mis propiedades" para pedir un cupo pagado (simulado, sin
 * Stripe real todavía) en el carrusel de "Colecciones Destacadas" del
 * inicio — ver app/api/featured/route.ts. Si la propiedad ya tiene un cupo
 * activo, muestra el badge con la fecha en vez del botón.
 */
export function FeatureListingButton({ listingId, featuredUntil, slotsFull, onFeatured }: FeatureListingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isActive = featuredUntil != null && new Date(featuredUntil) > new Date();

  if (isActive) {
    const label = new Date(featuredUntil!).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary">
        <Sparkles size={13} /> Destacada hasta el {label}
      </span>
    );
  }

  const handleFeature = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo destacar la propiedad — intenta de nuevo.");
      onFeatured(data.slot.endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo destacar la propiedad — intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleFeature}
        disabled={loading || slotsFull}
        title={slotsFull ? "No hay cupos disponibles esta semana" : undefined}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-outline/20 text-on-surface hover:border-primary hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-outline/20 disabled:hover:text-on-surface"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        Destacar en Inicio · $50 MXN/semana
      </button>
      {slotsFull && !error && (
        <p className="text-[11px] text-on-surface-variant">Sin cupos disponibles esta semana.</p>
      )}
      {error && <p className="text-[11px] font-medium text-error">{error}</p>}
    </div>
  );
}
