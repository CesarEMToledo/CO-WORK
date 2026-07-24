"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, List, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { CategoryFilters } from "@/components/ui/CategoryFilters";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { ExploreMap } from "@/components/properties/ExploreMap";
import { FiltersModal } from "@/components/properties/FiltersModal";
import { allProperties, type PropertyCategory } from "@/data/mockProperties";
import { useFavorites } from "@/lib/use-favorites";
import { usePublishedProperties } from "@/lib/use-published-properties";
import { useExploreFilters } from "@/lib/use-explore-filters";
import {
  AMENITY_FILTER_OPTIONS,
  SPACE_CATEGORIES,
  countActiveFilters,
  formatShortDate,
  matchesFilters,
} from "@/lib/property-filters";
import { toMapPoint } from "@/lib/map-markers";

type MobileView = "list" | "map";

export function ExplorePage() {
  const { filters, updateFilters, resetFilters } = useExploreFilters();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { published } = usePublishedProperties();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Local, debounced echo of the URL-backed query so typing doesn't fire a
  // router.replace on every keystroke.
  const [queryDraft, setQueryDraft] = useState(filters.query);
  useEffect(() => setQueryDraft(filters.query), [filters.query]);
  useEffect(() => {
    if (queryDraft === filters.query) return;
    const timer = setTimeout(() => updateFilters({ query: queryDraft }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDraft]);

  const catalog = useMemo(() => [...published, ...allProperties], [published]);

  const filtered = useMemo(() => catalog.filter((p) => matchesFilters(p, filters)), [catalog, filters]);

  const points = useMemo(() => filtered.map(toMapPoint), [filtered]);

  // Drop a selection that scrolled out of the current filtered result set.
  useEffect(() => {
    if (selectedId && !filtered.some((p) => p.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  const activeCount = countActiveFilters(filters);

  const categoryChip = filters.category !== "all" ? SPACE_CATEGORIES.find((c) => c.id === filters.category)?.label : null;
  const amenityChips = filters.amenities
    .map((id) => AMENITY_FILTER_OPTIONS.find((a) => a.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)]">
      <div className="border-b border-outline/10 bg-background px-4 sm:px-6 lg:px-8 py-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">
              {filtered.length} {filtered.length === 1 ? "Espacio" : "Espacios"} en la Huasteca
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-56">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              <input
                type="text"
                value={queryDraft}
                onChange={(e) => setQueryDraft(e.target.value)}
                placeholder="Ciudad, paraje o dirección..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
            <div
              className="flex items-center gap-1.5 pl-3 pr-2 py-2 rounded-lg border border-outline/20 bg-white"
              title="Fechas de renta: solo muestran espacios en renta libres en ese rango"
            >
              <CalendarRange size={14} className="text-on-surface-variant/50 shrink-0" />
              <input
                type="date"
                value={filters.checkIn ?? ""}
                onChange={(e) => {
                  const checkIn = e.target.value || null;
                  updateFilters({
                    checkIn,
                    checkOut: checkIn && filters.checkOut && filters.checkOut <= checkIn ? null : filters.checkOut,
                  });
                }}
                aria-label="Fecha de llegada (renta)"
                className="w-[6.5rem] bg-transparent outline-none text-xs font-semibold text-on-surface"
              />
              <span className="text-on-surface-variant/40 text-xs">→</span>
              <input
                type="date"
                value={filters.checkOut ?? ""}
                min={filters.checkIn ?? undefined}
                onChange={(e) => updateFilters({ checkOut: e.target.value || null })}
                aria-label="Fecha de salida (renta)"
                className="w-[6.5rem] bg-transparent outline-none text-xs font-semibold text-on-surface"
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="relative shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline/20 bg-white text-on-surface font-bold text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <SlidersHorizontal size={16} /> Filtros
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-extrabold">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <CategoryFilters
          active={filters.category}
          onChange={(category: PropertyCategory | "all") => updateFilters({ category })}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        {(categoryChip || amenityChips.length > 0 || (filters.checkIn && filters.checkOut)) && (
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll">
            {categoryChip && (
              <button
                onClick={() => updateFilters({ category: "all" })}
                className="shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-sahara-container text-on-surface text-xs font-bold whitespace-nowrap"
              >
                {categoryChip} <X size={12} />
              </button>
            )}
            {filters.checkIn && filters.checkOut && (
              <button
                onClick={() => updateFilters({ checkIn: null, checkOut: null })}
                className="shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-sahara-container text-on-surface text-xs font-bold whitespace-nowrap"
              >
                {formatShortDate(filters.checkIn)} → {formatShortDate(filters.checkOut)} <X size={12} />
              </button>
            )}
            {amenityChips.map((label) => {
              const option = AMENITY_FILTER_OPTIONS.find((a) => a.label === label);
              return (
                <button
                  key={label}
                  onClick={() => option && updateFilters({ amenities: filters.amenities.filter((a) => a !== option.id) })}
                  className="shrink-0 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-sahara-container text-on-surface text-xs font-bold whitespace-nowrap"
                >
                  {label} <X size={12} />
                </button>
              );
            })}
            <button
              onClick={resetFilters}
              className="shrink-0 text-xs font-bold text-primary underline underline-offset-2 whitespace-nowrap"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-full md:w-[46%] lg:w-[40%] xl:w-[36%] overflow-y-auto ${mobileView === "map" ? "hidden md:block" : "block"}`}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 px-6">
              <div className="w-14 h-14 bg-sahara-container rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-on-surface-variant" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Sin resultados</h3>
              <p className="text-on-surface-variant text-sm max-w-xs mb-4">
                No encontramos espacios con estos filtros. Prueba quitando alguno.
              </p>
              <button onClick={resetFilters} className="text-sm font-bold text-primary underline underline-offset-2">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4 p-4 sm:p-6">
              {filtered.map((property, idx) => (
                <div key={property.id} className="animate-fade-in h-full" style={{ animationDelay: `${Math.min(idx, 7) * 60}ms` }}>
                  <PropertyCard
                    property={property}
                    isFavorite={isFavorite(property.id)}
                    onToggleFavorite={toggleFavorite}
                    highlighted={hoveredId === property.id || selectedId === property.id}
                    onHoverChange={(hovering) => setHoveredId(hovering ? property.id : null)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`flex-1 relative isolate ${mobileView === "list" ? "hidden md:block" : "block"}`}>
          {/* `isolate` boxes in Leaflet's internal panes/controls, which default to
              z-index up to ~1000 and would otherwise escape into the page's stacking
              context and render on top of the Filtros modal (and anything else). */}
          <ExploreMap
            points={points}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        </div>

        <button
          type="button"
          onClick={() => setMobileView((v) => (v === "list" ? "map" : "list"))}
          className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full bg-on-surface text-white font-bold text-sm shadow-lg z-10"
        >
          {mobileView === "list" ? (
            <>
              <MapIcon size={16} /> Ver mapa
            </>
          ) : (
            <>
              <List size={16} /> Ver lista
            </>
          )}
        </button>
      </div>

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={updateFilters}
        properties={catalog}
      />
    </div>
  );
}
