"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Info, Loader2, Plus, Sparkles } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import type { MonthlyEarningsRow, OwnedListing } from "@/components/listings/types";

function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function MisPropiedades() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listings, setListings] = useState<OwnedListing[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarningsRow[]>([]);
  const [activeFeaturedCount, setActiveFeaturedCount] = useState(0);
  const [maxFeaturedSlots, setMaxFeaturedSlots] = useState(6);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/listings/mine", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.listings) {
          setListings(data.listings);
          setMonthlyEarnings(data.monthlyEarnings ?? []);
          setActiveFeaturedCount(data.activeFeaturedCount ?? 0);
          setMaxFeaturedSlots(data.maxFeaturedSlots ?? 6);
        } else {
          setError(data.error || "No se pudieron cargar tus propiedades.");
        }
      })
      .catch(() => setError("No se pudieron cargar tus propiedades — revisa tu conexión."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const hasRentals = listings.some((l) => l.type === "RENTA");

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-on-surface-variant py-16 justify-center">
        <Loader2 size={18} className="animate-spin" /> Cargando tus propiedades...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm font-medium text-error py-8 text-center">{error}</p>;
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-on-surface-variant text-sm mb-4">Todavía no has publicado ninguna propiedad.</p>
        <Link
          href="/publicar"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg transition-colors"
        >
          <Plus size={16} /> Publicar mi primera propiedad
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hasRentals && (
        <section className="bg-white rounded-lg shadow-card p-5">
          <h2 className="font-extrabold text-on-surface mb-1">Ganancias netas por mes (rentas)</h2>
          <p className="text-xs text-on-surface-variant mb-4 flex items-start gap-1.5">
            <Info size={14} className="shrink-0 mt-0.5 text-primary" />
            Esto es un ESTIMADO, no asesoría fiscal — resta la comisión de Stripe, la comisión del sitio (2%) y un
            estimado de impuestos sobre lo que registraste como cobrado. Confirma las cifras exactas con tu
            contador antes de declarar.
          </p>
          {monthlyEarnings.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Todavía no has registrado ninguna renta cobrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-on-surface-variant uppercase border-b border-outline/10">
                    <th className="pb-2 pr-4">Mes</th>
                    <th className="pb-2 pr-4">Rentas</th>
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
      )}

      <section className="bg-white rounded-lg shadow-card p-5 flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Sparkles size={17} />
        </span>
        <div>
          <h2 className="font-extrabold text-on-surface text-sm">
            Colecciones Destacadas — {activeFeaturedCount}/{maxFeaturedSlots} cupos ocupados esta semana
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Destaca una propiedad para que aparezca en el carrusel de inicio por 7 días — $50 MXN/semana. Cupo
            limitado a {maxFeaturedSlots} propiedades a la vez; libera un cupo la propiedad que ya lleva sus 7 días.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-on-surface">Tus propiedades publicadas ({listings.length})</h2>
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            <Plus size={15} /> Publicar otra
          </Link>
        </div>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onUpdated={(updated) => setListings((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)))}
            onRentalLogged={load}
            onFeatured={load}
            featuredSlotsFull={activeFeaturedCount >= maxFeaturedSlots}
          />
        ))}
      </section>
    </div>
  );
}
