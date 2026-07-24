"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import type { RentalTransactionRow } from "./types";

function formatMXN(amount: number | string): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(amount));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

interface ListingRentalsProps {
  listingId: string;
  /** Se llama después de registrar una renta nueva, para que el dashboard actualice los totales. */
  onRentalLogged: () => void;
}

/** Historial de rentas ya cobradas de una propiedad + formulario para registrar una nueva. */
export function ListingRentals({ listingId, onRentalLogged }: ListingRentalsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rentals, setRentals] = useState<RentalTransactionRow[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [guestName, setGuestName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`/api/listings/${listingId}/rentals`)
      .then((res) => res.json())
      .then((data) => {
        if (data.rentals) setRentals(data.rentals);
        else setError(data.error || "No se pudo cargar el historial de rentas.");
      })
      .catch(() => setError("No se pudo cargar el historial de rentas — revisa tu conexión."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [listingId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amount = Number(grossAmount);
    if (!startDate || !endDate || !amount || amount <= 0) {
      setFormError("Completa las fechas y un monto cobrado válido.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/rentals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          grossAmount: amount,
          guestName: guestName.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo registrar la renta.");

      setStartDate("");
      setEndDate("");
      setGrossAmount("");
      setGuestName("");
      setNotes("");
      setShowForm(false);
      load();
      onRentalLogged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar la renta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-on-surface-variant">
          Registra aquí cada renta que ya cobraste para ver cuántas veces se ha rentado y tus ganancias netas
          estimadas por mes.
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors"
        >
          <Plus size={13} /> Registrar renta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-outline/15 p-3 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Del</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-outline/20 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Al</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-outline/20 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Monto cobrado (MXN)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="Ej. 8200"
                className="w-full px-2.5 py-1.5 rounded-lg border border-outline/20 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Huésped (opcional)</label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-outline/20 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Notas (opcional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-outline/20 text-xs focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          {formError && <p className="text-xs font-medium text-error">{formError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-on-surface hover:bg-on-surface/90 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? "Guardando..." : "Guardar renta"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant py-6 justify-center">
          <Loader2 size={16} className="animate-spin" /> Cargando rentas...
        </div>
      ) : error ? (
        <p className="text-sm font-medium text-error py-2">{error}</p>
      ) : rentals.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-4 text-center">Todavía no has registrado ninguna renta.</p>
      ) : (
        <div className="space-y-2">
          {rentals.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-outline/15 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-on-surface">
                  {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  {r.guestName && <span className="text-on-surface-variant font-medium"> · {r.guestName}</span>}
                </p>
                <p className="font-extrabold text-on-surface">{formatMXN(r.netAmount)} <span className="text-[10px] font-semibold text-on-surface-variant">neto</span></p>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Cobrado {formatMXN(r.grossAmount)} — Stripe {formatMXN(r.stripeFeeAmount)}, comisión del sitio{" "}
                {formatMXN(r.platformFeeAmount)}, impuesto estimado {formatMXN(r.estimatedTaxAmount)}
              </p>
              {r.notes && <p className="text-xs text-on-surface-variant mt-1">"{r.notes}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
