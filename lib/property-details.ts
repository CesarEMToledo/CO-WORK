import { allProperties } from "@/data/mockProperties";
import type {
  Property,
  PropertyAgent,
  PropertyBilling,
  PropertyCategory,
  PropertyCoordinates,
} from "@/data/mockProperties";

/**
 * Presentation-layer enrichment for the property detail page.
 * Every listing can carry explicit `agent` / `coordinates` / `amenities` / `billing` / `images`
 * fields, but for the mock catalog (and anything published via /publicar) we derive
 * sensible, deterministic defaults so the detail page always has something to show.
 */

export const AGENCY_PHONE = "4811119463";

export const AGENTS: PropertyAgent[] = [
  { name: "Elena Fisher", role: "Asesora Prime Huasteca", phone: AGENCY_PHONE, initials: "EF" },
  { name: "Marco Rangel", role: "Asesor Senior CO-WORK", phone: AGENCY_PHONE, initials: "MR" },
  { name: "Diana Cruz", role: "Asesora de Ventas Huasteca", phone: AGENCY_PHONE, initials: "DC" },
  { name: "Luis Herrera", role: "Asesor de Renta Vacacional", phone: AGENCY_PHONE, initials: "LH" },
];

const LOCATION_COORDS: { keyword: string; lat: number; lng: number }[] = [
  { keyword: "xilitla", lat: 21.3833, lng: -98.9833 },
  { keyword: "tamasopo", lat: 21.9333, lng: -99.3167 },
  { keyword: "aquismon", lat: 21.6667, lng: -99.0 },
  { keyword: "naranjo", lat: 22.5167, lng: -99.3333 },
  { keyword: "micos", lat: 21.95, lng: -99.05 },
  { keyword: "rayon", lat: 21.75, lng: -98.97 },
  { keyword: "axtla", lat: 21.3667, lng: -98.8667 },
  { keyword: "valles", lat: 21.9833, lng: -99.0139 },
  { keyword: "lomas", lat: 21.9833, lng: -99.0139 },
];

const DEFAULT_COORDS: PropertyCoordinates = { lat: 21.9833, lng: -99.0139 }; // Ciudad Valles, SLP

const AMENITIES_BY_CATEGORY: Record<PropertyCategory, string[]> = {
  Villa: [
    "Alberca privada",
    "Cocina totalmente equipada",
    "Estacionamiento techado",
    "Jardín amplio",
    "Seguridad privada",
    "Terraza con asador",
  ],
  Cabaña: [
    "Chimenea o fogata",
    "Terraza con vista al río",
    "Asador propio",
    "Ropa de cama incluida",
    "Estacionamiento privado",
    "Acceso a senderos",
  ],
  Ecolodge: [
    "Energía solar",
    "Construcción con materiales locales",
    "Acceso a río o cascada",
    "Desayuno regional disponible",
    "Senderos naturales",
    "Iluminación de bajo impacto",
  ],
  Glamping: [
    "Domo climatizado",
    "Fogata privada",
    "Baño ecológico",
    "Terraza con hamacas",
    "Guía turístico opcional",
    "Desayuno incluido",
  ],
  Casa: [
    "Cocina integral",
    "Cochera para 2 autos",
    "Patio o jardín",
    "Cisterna y tinaco",
    "Cerca de zona comercial",
    "Seguridad en fraccionamiento",
  ],
  Departamento: [
    "Amueblado",
    "Seguridad privada",
    "Cercanía a plazas y escuelas",
    "Área de lavado",
    "Internet de alta velocidad",
    "Elevador o planta baja",
  ],
  Terreno: [
    "Uso de suelo habitacional",
    "Acceso a agua y luz",
    "Topografía plana",
    "Vista abierta",
    "Cerca de carretera principal",
    "Escrituras en regla",
  ],
  Oficina: [
    "Recepción equipada",
    "Internet de alta velocidad",
    "Estacionamiento para visitas",
    "Aire acondicionado",
    "Sala de juntas",
    "Seguridad en el edificio",
  ],
  Rancho: [
    "Pozo o acceso a agua",
    "Corrales y bebederos",
    "Terreno cercado",
    "Vivienda o casco principal",
    "Acceso para vehículos pesados",
    "Energía eléctrica",
  ],
};

const DEFAULT_BILLING_NOTE = "Todos nuestros precios incluyen impuestos para deducibilidad fiscal.";
const DEFAULT_BILLING_DETAIL =
  "Emitimos factura electrónica (CFDI) con tu RFC. Solicítala con tu asesor al confirmar tu reserva o compra.";

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getAgentForProperty(property: Property): PropertyAgent {
  if (property.agent) return property.agent;
  const idx = hashString(property.id) % AGENTS.length;
  return AGENTS[idx];
}

export function getCoordinatesForProperty(property: Property): PropertyCoordinates {
  if (property.coordinates) return property.coordinates;

  const loc = normalize(property.location);
  const match = LOCATION_COORDS.find((c) => loc.includes(c.keyword));
  const base = match ?? DEFAULT_COORDS;

  // Small deterministic jitter so listings in the same town don't stack on the same pin.
  const hash = hashString(property.id);
  const jitterLat = ((hash % 200) - 100) / 100000;
  const jitterLng = (((hash >> 8) % 200) - 100) / 100000;

  return { lat: base.lat + jitterLat, lng: base.lng + jitterLng };
}

export function getAmenitiesForProperty(property: Property): string[] {
  if (property.amenities) return property.amenities;
  return AMENITIES_BY_CATEGORY[property.category] ?? [];
}

export function getBillingInfo(property: Property): PropertyBilling {
  return (
    property.billing ?? {
      available: true,
      note: DEFAULT_BILLING_NOTE,
      detail: DEFAULT_BILLING_DETAIL,
    }
  );
}

// Every distinct photo already used across the mock catalog, used as a fallback pool
// so listings without an explicit `images` gallery still get a few extra thumbnails.
const ALL_IMAGE_URLS: string[] = Array.from(new Set(allProperties.map((p) => p.imageUrl)));

export function getGalleryForProperty(property: Property): string[] {
  if (property.images && property.images.length > 0) return property.images;

  const pool = ALL_IMAGE_URLS.filter((url) => url !== property.imageUrl);
  const gallery = [property.imageUrl];
  const extraCount = Math.min(3, pool.length);

  if (extraCount > 0) {
    const start = hashString(property.id) % pool.length;
    for (let i = 0; i < extraCount; i++) {
      gallery.push(pool[(start + i) % pool.length]);
    }
  }

  return gallery;
}
