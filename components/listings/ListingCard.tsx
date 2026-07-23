"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, Loader2, PencilLine, Users, Wallet } from "lucide-react";
import { ListingEditForm } from "./ListingEditForm";
import { ListingInteresados } from "./ListingInteresados";
import { ListingRentals } from "./ListingRentals";
import type { OwnedListing } from "./types";

const STATUS_OPTIONS: { value: NonNullable<OwnedListing["status"]>; label: string }[] = [
  { value: "disponible", label: "Disponible" },
  { value: "vendida", label: "Vendida" },
  { value: "rentada", label: "Rentada" },
  { value: "no_disponible", label: "No disponible" },
];

type Panel = "edit" | "interesados" | "rentals" | null;

function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

interface ListingCardProps {
  listing: OwnedListing;
  onUpdated: (updated: OwnedListing) => void;
  onRentalLogged: () => void;
}

export function ListingCard({ listing, onUpdated, onRentalLogged }: ListingCardProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  const togglePanel = (next: Panel) => setPanel((current) => (current === next ? null : next));

  const handleStatusChange = async (status: string) => {
    setStatusSaving(true);
    setStatusError("");
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar el estado.");
      onUpdated({ ...listing, status: data.listing.status });
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "No se pudo actualizar el estado.");
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative w-full sm:w-40 h-32 shrink-0 rounded-lg overflow-hidden bg-sahara-container">
          <Image src={listing.imageUrl} alt={listing.title} fill sizes="160px" className="object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                    listing.type === "VENTA" ? "bg-on-surface" : "bg-primary"
                  }`}
                >
                  EN {listing.type}
                </span>
                <Link
                  href={`/propiedad/${listing.id}`}
                  target="_blank"
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Ver anuncio <ExternalLink size={11} />
                </Link>
              </div>
              <h3 className="font-extrabold text-on-surface leading-tight">{listing.title}</h3>
              <p className="text-xs text-on-surface-variant">{listing.location}</p>
              <p className="text-sm font-bold text-on-surface mt-1">
                {listing.price} {listing.priceSuffix && <span className="text-xs font-semibold text-on-surface-variant">{listing.priceSuffix}</span>}
              </p>
            </div>

            <div className="text-right shrink-0">
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1">Estado</label>
              <select
                value={listing.status ?? "disponible"}
                disabled={statusSaving}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {statusSaving && <Loader2 size={12} className="animate-spin inline-block ml-1" />}
            </div>
          </div>

          {statusError && <p className="text-xs font-medium text-red-600 mt-1">{statusError}</p>}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              type="button"
              onClick={() => togglePanel("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                panel === "edit" ? "bg-primary text-white" : "border border-outline/20 text-on-surface hover:border-primary hover:text-primary"
              }`}
            >
              <PencilLine size={13} /> Editar
              {panel === "edit" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button
              type="button"
              onClick={() => togglePanel("interesados")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                panel === "interesados" ? "bg-primary text-white" : "border border-outline/20 text-on-surface hover:border-primary hover:text-primary"
              }`}
            >
              <Users size={13} /> Interesados ({listing.interesadosCount})
              {panel === "interesados" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {listing.type === "RENTA" && (
              <button
                type="button"
                onClick={() => togglePanel("rentals")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  panel === "rentals" ? "bg-primary text-white" : "border border-outline/20 text-on-surface hover:border-primary hover:text-primary"
                }`}
              >
                <Wallet size={13} /> Rentas ({listing.rentalCount}) · {formatMXN(listing.totalNetEarnings)} neto
                {panel === "rentals" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {panel && (
        <div className="border-t border-outline/10 p-4">
          {panel === "edit" && (
            <ListingEditForm
              listing={listing}
              onSaved={(updated) => {
                onUpdated(updated);
                setPanel(null);
              }}
              onCancel={() => setPanel(null)}
            />
          )}
          {panel === "interesados" && <ListingInteresados listingId={listing.id} />}
          {panel === "rentals" && <ListingRentals listingId={listing.id} onRentalLogged={onRentalLogged} />}
        </div>
      )}
    </div>
  );
}
