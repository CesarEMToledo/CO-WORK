"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Property } from "@/data/mockProperties";
import { createListenerSet } from "./browser-store";

// Antes esto vivía en localStorage (solo en el navegador de quien publicaba).
// Ahora las propiedades publicadas viven en la base de datos (tabla
// Listing), ligadas al usuario que las publicó, así que "Mis propiedades"
// funciona igual desde cualquier dispositivo. Este hook mantiene el MISMO
// shape público ({ published, addProperty }) que ya usan Home.tsx,
// ExplorePage.tsx y la página de detalle de la propiedad, para no tener que
// tocar esos archivos.
const store = createListenerSet();
let cache: Property[] = [];
let hasLoaded = false;
let inflight: Promise<void> | null = null;

async function loadListings(): Promise<void> {
  try {
    const res = await fetch("/api/listings", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cache = Array.isArray(data.listings) ? data.listings : [];
    }
  } catch {
    // Sin conexión — se sigue mostrando lo que ya había en cache (puede
    // estar vacío si es la primera carga).
  } finally {
    hasLoaded = true;
    inflight = null;
    store.emit();
  }
}

function ensureLoaded() {
  if (hasLoaded || inflight) return;
  inflight = loadListings();
}

function getSnapshot(): Property[] {
  return cache;
}

const EMPTY_PUBLISHED: Property[] = [];

function getServerSnapshot(): Property[] {
  return EMPTY_PUBLISHED;
}

// Además del shape público Property, la API necesita las partes sueltas de
// la dirección (para poder editarlas después desde "Mis propiedades") — ver
// app/api/listings/route.ts.
export interface PublishListingInput extends Omit<Property, "id"> {
  estado: string;
  municipio: string;
  localidad?: string;
  calle: string;
  numero?: string;
  colonia?: string;
}

export function usePublishedProperties() {
  const published = useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  const addProperty = useCallback(async (property: PublishListingInput) => {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(property),
    });
    const responseData = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(responseData.error || "No se pudo publicar la propiedad — intenta de nuevo.");
    }
    const listing = responseData.listing as Property;
    cache = [listing, ...cache];
    store.emit();
    return listing;
  }, []);

  // Por si algo más (p. ej. el dashboard "Mis propiedades" tras editar una
  // propiedad) necesita forzar una relectura del catálogo público.
  const refresh = useCallback(() => {
    hasLoaded = false;
    ensureLoaded();
  }, []);

  return { published, addProperty, refresh };
}
