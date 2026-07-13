import type { PropertyCategory } from "@/data/mockProperties";

interface CategoryBadgeProps {
  category: PropertyCategory;
  className?: string;
}

/**
 * The second (and last) badge type used across the project — always shown
 * alongside the VENTA/RENTA tag to identify the kind of property (Villa,
 * Casa, Terreno, Oficina, etc.). No more marketing-flavored badges
 * (Exclusivo, Top Rated, Ecológico...) — just these two everywhere.
 */
export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return (
    <div
      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/90 text-on-surface ${className}`}
    >
      {category}
    </div>
  );
}
