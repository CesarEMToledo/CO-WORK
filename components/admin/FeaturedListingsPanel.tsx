"use client";

import { useCallback, useEffect, useState } from "react";
import { Info, Loader2, Plus, Sparkles } from "lucide-react";

interface FeaturedSlotRow {
  id: string;
  startDate: string;
  endDate: string;
  isComplimentary: boolean;
  grossAmount: string;
  stripeFeeAmount: string;
  platformFeeAmount: string;
  estimatedTaxAmount: string;
  netAmount: string;
  listing: { title: string; operation: "VENTA" | "RENTA"; location: string };
  addedBy: { name: string };
}

interface AvailableListing {
  id: string;
  title: string;
  operation: "VENTA" | "RENTA";
  location: string;
}

interface MonthlyEarningsRow {
  month: string;
  label: string;
  rentalCount: number;
  grossAmount: number;
  stripeFeeAmount: number;
  platformFeeAmount: number;
  estimatedTaxAmount: number;
  netAmount: number;
}

function formatMXN(amount: number | string): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(amount));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Panel de administración de "Colecciones Destacadas" — ver
 * app/api/admin/featured/route.ts (lectura) y app/api/featured/route.ts
 * (POST para agregar, el mismo que usan los dueños desde "Mis propiedades",
 * solo que aquí un admin puede elegir CUALQUIER propiedad y queda gratis).
 */
export function FeaturedListingsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<FeaturedSlotRow[]>([]);
  const [availableListings, setAvailableListings] = useState<AvailableListing[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarningsRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(6);

  const [selectedListingId, setSelectedListingId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/featured", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) {
          setSlots(data.slots);
          setAvailableListings(data.availableListings ?? []);
          setMonthlyEarnings(data.monthlyEarnings ?? []);
          setActiveCount(data.activeCount ?? 0);
          setMaxSlots(data.maxSlots ?? 6);
          setSelectedListingId((data.availableListings ?? [])[0]?.id ?? "");
        } else {
          setError(data.error || "No se pudo cargar el panel de destacados.");
        }
      })
      .catch(() => setError("No se pudo cargar el panel de destacados — revisa tu conexión."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const slotsFull = activeCount >= maxSlots;

  const handleAdd = async () => {
    if (!selectedListingId) return;
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: selectedListingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo agregar la propiedad.");
      load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "No se pudo agregar la propiedad.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-on-surface-variant py-16 justify-center">
        <Loader2 size={18} className="animate-spin" /> Cargando...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm font-medium text-error py-8 text-center">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-card p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-extrabold text-on-surface">
            Cupos ocupados: {activeCount}/{maxSlots}
          </h2>
        </div>
        <div className="w-full h-2 rounded-full bg-sahara-container overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(100, (activeCount / maxSlots) * 100)}%` }}
          />
        </div>

        <label className="block text-xs font-semibold text-on-surface-variant mb-1">
          Agregar propiedad gratis (no cuenta como cobrada)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedListingId}
            onChange={(e) => setSelectedListingId(e.target.value)}
            disabled={slotsFull || availableListings.length === 0}
            aria-label="Elegir propiedad para destacar gratis"
            className="flex-1 px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
          >
            {availableListings.length === 0 ? (
              <option>No hay propiedades disponibles para agregar</option>
            ) : (
              availableListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} · {l.operation} · {l.location}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || slotsFull || availableListings.length === 0}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Agregar gratis
          </button>
        </div>
        {slotsFull && (
          <p className="text-xs text-on-surface-variant mt-2">
            No hay cupos disponibles esta semana — libera uno cuando termine el de alguna propiedad.
          </p>
        )}
        {addError && <p className="text-xs font-medium text-error mt-2">{addError}</p>}
      </section>

      <section className="bg-white rounded-lg shadow-card p-5">
        <h2 className="font-extrabold text-on-surface mb-1">Ganancias mensuales de Colecciones Destacadas</h2>
        <p className="text-xs text-on-surface-variant mb-4 flex items-start gap-1.5">
          <Info size={14} className="shrink-0 mt-0.5 text-primary" />
          Esto es un ESTIMADO, no asesoría fiscal — resta la comisión de Stripe, la comisión de la plataforma (2%)
          y un estimado de impuestos. Los cupos agregados gratis por un admin no generan ingreso (quedan en $0).
          Ningún cobro real por Stripe se ha hecho todavía — esta funcionalidad está lista, pero el checkout real
          se conecta aparte.
        </p>
        {monthlyEarnings.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Todavía no hay cupos destacados registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold text-on-surface-variant uppercase border-b border-outline/10">
                  <th className="pb-2 pr-4">Mes</th>
                  <th className="pb-2 pr-4">Cupos</th>
                  <th className="pb-2 pr-4">Bruto</th>
                  <th className="pb-2 pr-4">Stripe</th>
                  <th className="pb-2 pr-4">Sitio (2%)</th>
                  <th className="pb-2 pr-4">Impuesto est.</th>
                  <th className="pb-2">Neto</th>
                </tr>
              </thead>
              <tbody>
                {monthlyEarnings.map((m) => (
                  <tr key={m.month} className="border-b border-outline/5 last:border-0">
                    <td className="py-2 pr-4 font-semibold text-on-surface capitalize">{m.label}</td>
                    <td className="py-2 pr-4 text-on-surface-variant">{m.rentalCount}</td>
                    <td className="py-2 pr-4 text-on-surface-variant">{formatMXN(m.grossAmount)}</td>
                    <td className="py-2 pr-4 text-on-surface-variant">{formatMXN(m.stripeFeeAmount)}</td>
                    <td className="py-2 pr-4 text-on-surface-variant">{formatMXN(m.platformFeeAmount)}</td>
                    <td className="py-2 pr-4 text-on-surface-variant">{formatMXN(m.estimatedTaxAmount)}</td>
                    <td className="py-2 font-extrabold text-on-surface">{formatMXN(m.netAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg shadow-card overflow-hidden">
        <h2 className="font-extrabold text-on-surface p-5 pb-0">Historial de cupos ({slots.length})</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-on-surface-variant p-5">Todavía no se ha destacado ninguna propiedad.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm mt-3">
              <thead>
                <tr className="border-b border-outline/10 text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  <th className="px-5 py-3 font-bold">Propiedad</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3 font-bold">Tipo</th>
                  <th className="px-4 py-3 font-bold">Agregó</th>
                  <th className="px-4 py-3 font-bold">Del — al</th>
                  <th className="px-4 py-3 font-bold text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => {
                  const active = new Date(s.endDate) > new Date();
                  return (
                    <tr key={s.id} className="border-b border-outline/10 last:border-0">
                      <td className="px-5 py-3">
                        <div className="font-bold text-on-surface">{s.listing.title}</div>
                        <div className="text-xs text-on-surface-variant">
                          {s.listing.operation} · {s.listing.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            active ? "text-success" : "text-on-surface-variant"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${active ? "bg-success" : "bg-outline"}`} />
                          {active ? "Activo" : "Expirado"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.isComplimentary ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                            <Sparkles size={12} /> Gratis
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-on-surface-variant">Pagado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{s.addedBy.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {formatDate(s.startDate)} – {formatDate(s.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-on-surface">{formatMXN(s.netAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
