import type { Property, PropertyCategory } from "@/data/mockProperties";
import { getAmenitiesForProperty } from "./property-details";

/**
 * Central filter model for the property catalog. Kept framework-agnostic
 * (no Next.js imports) so it can be reused anywhere a list of Property
 * needs filtering — today that's /explorar, and it's a natural fit for
 * folding the homepage's ad-hoc filters (components/Home.tsx) into later.
 */

export type OperationFilter = "all" | "VENTA" | "RENTA";

export interface PropertyFilters {
  operation: OperationFilter;
  query: string;
  category: PropertyCategory | "all";
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number;
  minBaths: number;
  amenities: string[]; // AmenityFilterOption ids
  /** RENTA-only "fechas de tu estancia" search. ISO dates ("YYYY-MM-DD") or null. */
  checkIn: string | null;
  checkOut: string | null;
}

export const DEFAULT_FILTERS: PropertyFilters = {
  operation: "all",
  query: "",
  category: "all",
  minPrice: null,
  maxPrice: null,
  minBeds: 0,
  minBaths: 0,
  amenities: [],
  checkIn: null,
  checkOut: null,
};

/** Full space-type vocabulary (data/mockProperties.ts's CATEGORIES only lists the 4 homepage quick-filters). */
export const SPACE_CATEGORIES: { id: PropertyCategory; label: string }[] = [
  { id: "Villa", label: "Villa" },
  { id: "Cabaña", label: "Cabaña" },
  { id: "Ecolodge", label: "Ecolodge" },
  { id: "Glamping", label: "Glamping" },
  { id: "Casa", label: "Casa" },
  { id: "Departamento", label: "Departamento" },
  { id: "Terreno", label: "Terreno" },
  { id: "Oficina", label: "Oficina" },
  { id: "Rancho", label: "Rancho" },
];

export interface AmenityFilterOption {
  id: string;
  label: string;
  icon: string; // lucide-react icon component name, see FiltersModal's AMENITY_ICONS map
  /** lowercase substrings matched against each property's derived amenity list */
  keywords: string[];
}

// Curated from the real strings in lib/property-details.ts's AMENITIES_BY_CATEGORY, matched by
// keyword rather than exact string so new amenities added there keep working here for free.
export const AMENITY_FILTER_OPTIONS: AmenityFilterOption[] = [
  { id: "wifi", label: "Internet de Alta Velocidad", icon: "Wifi", keywords: ["internet", "wifi"] },
  { id: "pool", label: "Alberca", icon: "Waves", keywords: ["alberca"] },
  { id: "ac", label: "Aire Acondicionado", icon: "Wind", keywords: ["aire acondicionado"] },
  { id: "parking", label: "Estacionamiento", icon: "ParkingCircle", keywords: ["estacionamiento", "cochera"] },
  { id: "security", label: "Seguridad Privada", icon: "ShieldCheck", keywords: ["seguridad"] },
  { id: "fire", label: "Chimenea o Fogata", icon: "Flame", keywords: ["chimenea", "fogata", "asador"] },
  { id: "solar", label: "Energía Solar", icon: "Sun", keywords: ["energía solar", "energia solar"] },
  { id: "breakfast", label: "Desayuno Incluido", icon: "Coffee", keywords: ["desayuno"] },
];

export function parsePriceValue(price: string): number {
  const digits = price.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Reads a numeric spec value (e.g. bedrooms from the "king_bed" spec) if the property has it. */
export function getSpecValue(property: Property, icon: string): number | null {
  const spec = property.specs.find((s) => s.icon === icon);
  if (!spec) return null;
  const n = parseFloat(spec.label.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

/** True when a listing is on the market at all — sold/off-market listings are hidden everywhere, not just when date-searching. */
export function isPropertyAvailable(property: Property): boolean {
  return !property.status || property.status === "disponible";
}

function toDayNumber(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getTime();
}

/** Half-open interval overlap: [checkIn, checkOut) vs each booked [start, end]. */
export function isBookedDuring(property: Property, checkIn: string, checkOut: string): boolean {
  if (!property.bookedDates || property.bookedDates.length === 0) return false;
  const reqStart = toDayNumber(checkIn);
  const reqEnd = toDayNumber(checkOut);
  if (Number.isNaN(reqStart) || Number.isNaN(reqEnd) || reqEnd <= reqStart) return false;

  return property.bookedDates.some((range) => {
    const bookedStart = toDayNumber(range.start);
    const bookedEnd = toDayNumber(range.end);
    return reqStart < bookedEnd && reqEnd > bookedStart;
  });
}

const SHORT_MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-07-22" -> "22 jul" */
export function formatShortDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
}

export function matchesFilters(property: Property, filters: PropertyFilters): boolean {
  // Sold / withdrawn listings never show up in search, in either operation.
  if (!isPropertyAvailable(property)) return false;

  if (filters.operation !== "all" && property.type !== filters.operation) return false;
  if (filters.category !== "all" && property.category !== filters.category) return false;

  // Date-range search only makes sense for RENTA; a VENTA listing simply
  // isn't excluded by it even if dates happen to be set while browsing "Todos".
  if (property.type === "RENTA" && filters.checkIn && filters.checkOut) {
    if (isBookedDuring(property, filters.checkIn, filters.checkOut)) return false;
  }

  const q = filters.query.trim().toLowerCase();
  if (q && !property.title.toLowerCase().includes(q) && !property.location.toLowerCase().includes(q)) {
    return false;
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const price = parsePriceValue(property.price);
    if (filters.minPrice != null && price < filters.minPrice) return false;
    if (filters.maxPrice != null && price > filters.maxPrice) return false;
  }

  if (filters.minBeds > 0) {
    const beds = getSpecValue(property, "king_bed");
    if (beds == null || beds < filters.minBeds) return false;
  }

  if (filters.minBaths > 0) {
    const baths = getSpecValue(property, "bathtub");
    if (baths == null || baths < filters.minBaths) return false;
  }

  if (filters.amenities.length > 0) {
    const propertyAmenities = getAmenitiesForProperty(property).map((a) => a.toLowerCase());
    const passesAll = filters.amenities.every((filterId) => {
      const option = AMENITY_FILTER_OPTIONS.find((o) => o.id === filterId);
      if (!option) return true;
      return option.keywords.some((kw) => propertyAmenities.some((a) => a.includes(kw)));
    });
    if (!passesAll) return false;
  }

  return true;
}

export function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.operation !== "all") count++;
  if (filters.category !== "all") count++;
  if (filters.minPrice != null) count++;
  if (filters.maxPrice != null) count++;
  if (filters.minBeds > 0) count++;
  if (filters.minBaths > 0) count++;
  if (filters.checkIn && filters.checkOut) count++;
  count += filters.amenities.length;
  return count;
}

/** Minimal shape shared by URLSearchParams and Next's ReadonlyURLSearchParams, so this file stays framework-agnostic. */
interface SearchParamsLike {
  get(key: string): string | null;
}

const PARAM_KEYS = {
  operation: "op",
  query: "q",
  category: "cat",
  minPrice: "pmin",
  maxPrice: "pmax",
  minBeds: "beds",
  minBaths: "baths",
  amenities: "am",
  checkIn: "in",
  checkOut: "out",
} as const;

export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.operation !== "all") params.set(PARAM_KEYS.operation, filters.operation);
  if (filters.query.trim()) params.set(PARAM_KEYS.query, filters.query.trim());
  if (filters.category !== "all") params.set(PARAM_KEYS.category, filters.category);
  if (filters.minPrice != null) params.set(PARAM_KEYS.minPrice, String(filters.minPrice));
  if (filters.maxPrice != null) params.set(PARAM_KEYS.maxPrice, String(filters.maxPrice));
  if (filters.minBeds > 0) params.set(PARAM_KEYS.minBeds, String(filters.minBeds));
  if (filters.minBaths > 0) params.set(PARAM_KEYS.minBaths, String(filters.minBaths));
  if (filters.amenities.length > 0) params.set(PARAM_KEYS.amenities, filters.amenities.join(","));
  if (filters.checkIn) params.set(PARAM_KEYS.checkIn, filters.checkIn);
  if (filters.checkOut) params.set(PARAM_KEYS.checkOut, filters.checkOut);
  return params;
}

export function filtersFromSearchParams(params: SearchParamsLike): PropertyFilters {
  const opRaw = params.get(PARAM_KEYS.operation);
  const operation: OperationFilter = opRaw === "VENTA" || opRaw === "RENTA" ? opRaw : "all";

  const catRaw = params.get(PARAM_KEYS.category);
  const category: PropertyFilters["category"] =
    catRaw && SPACE_CATEGORIES.some((c) => c.id === catRaw) ? (catRaw as PropertyCategory) : "all";

  const minPriceRaw = params.get(PARAM_KEYS.minPrice);
  const maxPriceRaw = params.get(PARAM_KEYS.maxPrice);
  const bedsRaw = params.get(PARAM_KEYS.minBeds);
  const bathsRaw = params.get(PARAM_KEYS.minBaths);
  const amenitiesRaw = params.get(PARAM_KEYS.amenities);
  const checkInRaw = params.get(PARAM_KEYS.checkIn);
  const checkOutRaw = params.get(PARAM_KEYS.checkOut);
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;

  return {
    operation,
    query: params.get(PARAM_KEYS.query) ?? "",
    category,
    minPrice: minPriceRaw ? Number(minPriceRaw) : null,
    maxPrice: maxPriceRaw ? Number(maxPriceRaw) : null,
    minBeds: bedsRaw ? Number(bedsRaw) : 0,
    minBaths: bathsRaw ? Number(bathsRaw) : 0,
    amenities: amenitiesRaw ? amenitiesRaw.split(",").filter(Boolean) : [],
    checkIn: checkInRaw && isoDate.test(checkInRaw) ? checkInRaw : null,
    checkOut: checkOutRaw && isoDate.test(checkOutRaw) ? checkOutRaw : null,
  };
}
