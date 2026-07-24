"use client";

import { SlidersHorizontal } from "lucide-react";
import { CATEGORIES, type PropertyCategory } from "@/data/mockProperties";

interface CategoryFiltersProps {
  active: PropertyCategory | "all";
  onChange: (category: PropertyCategory | "all") => void;
  onOpenFilters?: () => void;
}

export function CategoryFilters({ active, onChange, onOpenFilters }: CategoryFiltersProps) {
  return (
    <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto hide-scroll py-2">
      <button
        onClick={() => onChange("all")}
        className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5 ${
          active === "all"
            ? "bg-on-surface text-white shadow-soft"
            : "bg-white border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        Todos
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5 ${
            active === category.id
              ? "bg-on-surface text-white shadow-soft"
              : "bg-white border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          {category.label}
        </button>
      ))}
      <div className="w-px h-6 bg-outline/20 mx-2"></div>
      <button
        onClick={onOpenFilters}
        className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-lg text-on-surface font-bold text-sm hover:bg-primary/10 transition-colors"
      >
        <SlidersHorizontal size={16} /> Filtros
      </button>
    </div>
  );
}
