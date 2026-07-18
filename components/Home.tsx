"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryFilters } from "@/components/ui/CategoryFilters";
import { FeaturedCarousel } from "@/components/properties/FeaturedCarousel";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Footer } from "@/components/ui/Footer";
import { featuredCollections, marketUpdates, type PropertyCategory } from "@/data/mockProperties";
import { useFavorites } from "@/lib/use-favorites";
import { usePublishedProperties } from "@/lib/use-published-properties";
import { isPropertyAvailable } from "@/lib/property-filters";

type Operation = "all" | "VENTA" | "RENTA";

// 8 per page = exactly 2 full rows on xl screens (xl:grid-cols-4), so pages
// never end mid-row and the grid never feels like a wall of listings.
const PAGE_SIZE = 8;

/** Windowed page numbers with ellipsis gaps, e.g. [1, "...", 4, 5, 6, "...", 12]. */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = Array.from(keep)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Home() {
  const searchParams = useSearchParams();
  const initialOp = searchParams.get("op");
  const initialOperation: Operation = initialOp === "venta" ? "VENTA" : initialOp === "renta" ? "RENTA" : "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [operationFilter, setOperationFilter] = useState<Operation>(initialOperation);
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | "all">("all");
  const [page, setPage] = useState(1);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { published } = usePublishedProperties();

  // Sold / withdrawn listings never show up on the homepage, same rule as /explorar.
  const allMarketProperties = useMemo(
    () => [...published, ...marketUpdates].filter(isPropertyAvailable),
    [published]
  );
  const availableFeatured = useMemo(() => featuredCollections.filter(isPropertyAvailable), []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allMarketProperties.filter((p) => {
      const matchOperation = operationFilter === "all" || p.type === operationFilter;
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchSearch =
        q === "" || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
      return matchOperation && matchCategory && matchSearch;
    });
  }, [allMarketProperties, operationFilter, categoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const filterKey = `${operationFilter}|${categoryFilter}|${searchQuery}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  return (
    <>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight">
              Encuentra tu <span className="relative inline-block">
                <span className="relative z-10 text-primary">santuario</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/10 -rotate-1 z-0"></span>
              </span> en la Huasteca.
            </h1>
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={22} className="text-on-surface-variant/60 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 rounded-lg border-none bg-white text-on-surface shadow-soft placeholder-on-surface-variant/40 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg"
                placeholder="Busca por ciudad, paraje o dirección..."
                type="text"
              />
              <button className="absolute inset-y-2 right-2 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-primary/20">
                Buscar
              </button>
            </div>
            <CategoryFilters active={categoryFilter} onChange={setCategoryFilter} />
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface">Colecciones Destacadas</h2>
              <p className="text-on-surface-variant mt-1 text-sm">Propiedades curadas para una estancia inolvidable en San Luis Potosí.</p>
            </div>
            <a className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:opacity-70 transition-opacity" href="#">
              Ver todas <ArrowRight size={14} />
            </a>
          </div>
          <FeaturedCarousel properties={availableFeatured} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface">Novedades en el Mercado</h2>
              <p className="text-on-surface-variant mt-1 text-sm">Oportunidades frescas en los mejores parajes turísticos.</p>
            </div>
            <div className="flex bg-sahara-container p-1 rounded-lg self-start sm:self-auto">
              {(["all", "VENTA", "RENTA"] as Operation[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperationFilter(op)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    operationFilter === op
                      ? "bg-primary text-white shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {op === "all" ? "Todos" : op === "VENTA" ? "Venta" : "Renta"}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-sahara-container rounded-full flex items-center justify-center mb-4">
                <Search size={28} className="text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-on-surface">Sin resultados</h3>
              <p className="text-on-surface-variant text-sm max-w-xs">
                No encontramos propiedades para tu búsqueda. Probá con otra ciudad o quitá algunos filtros.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setOperationFilter("all");
                  setCategoryFilter("all");
                }}
                className="mt-4 text-sm font-medium text-primary underline underline-offset-2"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginated.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={isFavorite(property.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-on-surface-variant text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={currentPage === p ? "page" : undefined}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                          currentPage === p ? "bg-primary text-white" : "text-on-surface-variant hover:text-primary"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
