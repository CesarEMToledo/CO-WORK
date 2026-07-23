import type { Property, PropertyAgent, PropertySpec } from "@/data/mockProperties";

/**
 * Convierte un renglón de Listing (Prisma) al mismo shape `Property` que usa
 * todo el catálogo (data/mockProperties.ts) — así /explorar, la página de
 * inicio y la página de detalle de la propiedad no necesitan saber si un
 * listing viene de la base de datos o del catálogo estático, y siguen
 * funcionando sin cambios.
 */

// Shape mínimo que necesitamos del renglón de Prisma — se escribe a mano en
// vez de importar el tipo generado para no atar este archivo al cliente de
// Prisma (útil también si algún día se prueba con datos falsos).
export interface ListingRow {
  id: string;
  title: string;
  location: string;
  price: string;
  priceSuffix: string | null;
  operation: "VENTA" | "RENTA";
  category: string;
  description: string;
  specs: unknown;
  imageUrl: string;
  images: string[];
  videoUrl: string | null;
  status: "disponible" | "vendida" | "rentada" | "no_disponible";
  lat: unknown;
  lng: unknown;
}

export interface ListingOwner {
  name: string;
  phone: string | null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "object" && value !== null && "toNumber" in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toSpecs(value: unknown): PropertySpec[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is { icon?: unknown; label?: unknown } => typeof s === "object" && s !== null)
    .map((s) => ({ icon: String(s.icon ?? ""), label: String(s.label ?? "") }))
    .filter((s) => s.icon && s.label);
}

/** "Juan Pérez López" -> "JP". Usado como iniciales de respaldo del anfitrión. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "??";
}

/**
 * El teléfono del dueño se guarda con el formato libre que permite el
 * formulario de perfil (espacios, guiones, paréntesis, +52 opcional). Los
 * botones de WhatsApp/llamada del catálogo esperan solo los 10 dígitos
 * locales (ver AGENCY_PHONE en lib/property-details.ts), así que se
 * normaliza aquí.
 */
function normalizeMxPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length > 10 && digits.startsWith("52")) return digits.slice(-10);
  return digits.slice(-10);
}

function toAgent(owner: ListingOwner): PropertyAgent | undefined {
  const digits = owner.phone ? normalizeMxPhone(owner.phone) : "";
  // Sin teléfono no hay forma de contactar al dueño real — en ese caso se
  // deja `agent` sin definir, y getAgentForProperty() usa su asesor
  // "demo" de respaldo en vez de mostrar un botón de contacto roto.
  if (digits.length !== 10) return undefined;

  return {
    name: owner.name,
    role: "Propietario",
    phone: digits,
    initials: initialsFromName(owner.name),
  };
}

export function listingToProperty(listing: ListingRow, owner: ListingOwner): Property {
  const lat = toNumberOrNull(listing.lat);
  const lng = toNumberOrNull(listing.lng);

  return {
    id: listing.id,
    title: listing.title,
    location: listing.location,
    price: listing.price,
    priceSuffix: listing.priceSuffix ?? undefined,
    type: listing.operation,
    category: listing.category as Property["category"],
    description: listing.description,
    specs: toSpecs(listing.specs),
    imageUrl: listing.imageUrl,
    images: listing.images.length > 0 ? listing.images : undefined,
    videoUrl: listing.videoUrl ?? undefined,
    status: listing.status,
    agent: toAgent(owner),
    coordinates: lat != null && lng != null ? { lat, lng } : undefined,
  };
}
