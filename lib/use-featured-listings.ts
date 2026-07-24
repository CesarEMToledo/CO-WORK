"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Property } from "@/data/mockProperties";
import { createListenerSet } from "./browser-store";

// Mismo patrón que lib/use-published-properties.ts: cache a nivel de módulo
// + useSyncExternalStore, para que Home.tsx (y cualquier otro lugar que use
// este hook) comparta una sola carga.
const store = createListenerSet();
let cache: Property[] = [];
let activeCount = 0;
let maxSlots = 6;
let hasLoaded = false;
let inflight: Promise<void> | null = null;

async function loadFeatured(): Promise<void> {
  try {
    const res = await fetch("/api/featured", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cache = Array.isArray(data.listings) ? data.listings : [];
      activeCount = typeof data.activeCount === "number" ? data.activeCount : cache.length;
      maxSlots = typeof data.maxSlots === "number" ? data.maxSlots : maxSlots;
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
  inflight = loadFeatured();
}

function getSnapshot(): Property[] {
  return cache;
}

const EMPTY_FEATURED: Property[] = [];

function getServerSnapshot(): Property[] {
  return EMPTY_FEATURED;
}

/**
 * Propiedades con un cupo pagado (o regalado por un admin) activo en
 * "Colecciones Destacadas" — ver app/api/featured/route.ts. Máximo 6 a la
 * vez. Home.tsx rellena la sección con el catálogo curado estático cuando
 * todavía no hay ninguna propiedad destacada de verdad (p. ej. antes de que
 * alguien pague por primera vez), para que el carrusel no se quede vacío.
 */
export function useFeaturedListings() {
  const featured = useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  const refresh = useCallback(() => {
    hasLoaded = false;
    ensureLoaded();
  }, []);

  return { featured, activeCount, maxSlots, refresh };
}
