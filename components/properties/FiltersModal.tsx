"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, MapPin, Wifi, Waves, Wind, ParkingCircle, ShieldCheck, Flame, Sun, Coffee, type LucideIcon } from "lucide-react";
import type { Property } from "@/data/mockProperties";
import {
  AMENITY_FILTER_OPTIONS,
  DEFAULT_FILTERS,
  SPACE_CATEGORIES,
  matchesFilters,
  type OperationFilter,
  type PropertyFilters,
} from "@/lib/property-filters";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  Wifi,
  Waves,
  Wind,
  ParkingCircle,
  ShieldCheck,
  Flame,
  Sun,
  Coffee,
};

const OPERATION_OPTIONS: { id: OperationFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "RENTA", label: "Renta" },
  { id: "VENTA", label: "Compra" },
];

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

function Stepper({ label, value, onChange, max = 10 }: StepperProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-semibold text-on-surface">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          aria-label={`Reducir ${label.toLowerCase()}`}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-outline/20 text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center font-bold text-on-surface text-sm">{value === 0 ? "Any" : value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Aumentar ${label.toLowerCase()}`}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-outline/20 text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
  /** Unfiltered pool used only to compute the live "Mostrar N Espacios" count as the draft changes. */
  properties: Property[];
}

export function FiltersModal({ open, onClose, filters, onApply, properties }: FiltersModalProps) {
  const [draft, setDraft] = useState<PropertyFilters>(filters);

  // Re-seed the draft from the committed filters every time the modal opens,
  // so closing without applying (Cancelar / backdrop / Esc) is a true no-op.
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const resultCount = properties.filter((p) => matchesFilters(p, draft)).length;

  const toggleAmenity = (id: string) => {
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(id) ? d.amenities.filter((a) => a !== id) : [...d.amenities, id],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de búsqueda"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-lg shadow-soft flex flex-col"
      >
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-outline/10">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface">Filtros</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Ajusta tu búsqueda para encontrar el espacio ideal.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-sahara-container/60 hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Tipo de Operación</p>
            <div className="flex bg-sahara-container p-1 rounded-lg">
              {OPERATION_OPTIONS.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, operation: op.id }))}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    draft.operation === op.id ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div className={draft.operation === "VENTA" ? "opacity-40 pointer-events-none" : undefined}>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Fechas de tu Estancia <span className="font-normal normal-case">(solo Renta)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/70 mb-1 block">Llegada</label>
                <input
                  type="date"
                  value={draft.checkIn ?? ""}
                  onChange={(e) => {
                    const checkIn = e.target.value || null;
                    setDraft((d) => ({
                      ...d,
                      checkIn,
                      checkOut: checkIn && d.checkOut && d.checkOut <= checkIn ? null : d.checkOut,
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-sahara-container/40 focus:ring-2 focus:ring-primary focus:bg-white outline-none text-sm font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/70 mb-1 block">Salida</label>
                <input
                  type="date"
                  value={draft.checkOut ?? ""}
                  min={draft.checkIn ?? undefined}
                  onChange={(e) => setDraft((d) => ({ ...d, checkOut: e.target.value || null }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-sahara-container/40 focus:ring-2 focus:ring-primary focus:bg-white outline-none text-sm font-semibold"
                />
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Solo se mostrarán espacios en renta libres en esas fechas.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Ubicación</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                type="text"
                value={draft.query}
                onChange={(e) => setDraft((d) => ({ ...d, query: e.target.value }))}
                placeholder="Ciudad, municipio o zona..."
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline/20 bg-sahara-container/40 focus:ring-2 focus:ring-primary focus:bg-white outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Rango de Precio</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/70 mb-1 block">
                  Precio mínimo
                </label>
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline/20 bg-sahara-container/40 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white">
                  <span className="text-on-surface-variant/60 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={draft.minPrice ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value === "" ? null : Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/70 mb-1 block">
                  Precio máximo
                </label>
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline/20 bg-sahara-container/40 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white">
                  <span className="text-on-surface-variant/60 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={draft.maxPrice ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value === "" ? null : Number(e.target.value) }))}
                    placeholder="Sin límite"
                    className="w-full bg-transparent outline-none text-sm font-semibold text-on-surface"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Tipo de Espacio</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as PropertyFilters["category"] }))}
                className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-sahara-container/40 focus:ring-2 focus:ring-primary focus:bg-white outline-none text-sm font-semibold"
              >
                <option value="all">Todos</option>
                {SPACE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Stepper label="Habitaciones" value={draft.minBeds} onChange={(v) => setDraft((d) => ({ ...d, minBeds: v }))} />
              <Stepper label="Baños" value={draft.minBaths} onChange={(v) => setDraft((d) => ({ ...d, minBaths: v }))} />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Amenidades y Servicios</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AMENITY_FILTER_OPTIONS.map((amenity) => {
                const Icon = AMENITY_ICONS[amenity.icon] ?? Wifi;
                const active = draft.amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    aria-pressed={active}
                    className={`relative flex items-center gap-2.5 px-3.5 py-3 rounded-lg border text-left text-sm font-bold transition-colors ${
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline/20 text-on-surface-variant hover:border-primary/40"
                    }`}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="leading-tight">{amenity.label}</span>
                    {active && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-t border-outline/10">
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="text-sm font-bold text-on-surface-variant underline underline-offset-2 hover:text-primary transition-colors"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg transition-colors"
          >
            Mostrar {resultCount} {resultCount === 1 ? "Espacio" : "Espacios"}
          </button>
        </div>
      </div>
    </div>
  );
}
