"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createListenerSet } from "./browser-store";

export interface NotificationRow {
  id: string;
  type: "interesado" | "renta_registrada" | "propiedad_publicada";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

// Mismo patrón que lib/use-published-properties.ts (useSyncExternalStore +
// fetch), pero esto es data PRIVADA de quien tenga sesión — a diferencia del
// catálogo público, aquí sí importa limpiar el cache al cerrar sesión (ver
// el "if (!enabled)" abajo), para que no se le alcance a asomar a alguien la
// notificación de la cuenta anterior por un instante al cambiar de usuario
// en la misma pestaña.
const store = createListenerSet();
let cache: NotificationRow[] = [];
let hasLoaded = false;
let inflight: Promise<void> | null = null;

async function loadNotifications(): Promise<void> {
  try {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cache = Array.isArray(data.notifications) ? data.notifications : [];
    }
  } catch {
    // Sin conexión — se queda con lo que ya había en cache.
  } finally {
    hasLoaded = true;
    inflight = null;
    store.emit();
  }
}

function ensureLoaded() {
  if (hasLoaded || inflight) return;
  inflight = loadNotifications();
}

function getSnapshot(): NotificationRow[] {
  return cache;
}

const EMPTY: NotificationRow[] = [];
function getServerSnapshot(): NotificationRow[] {
  return EMPTY;
}

const POLL_INTERVAL_MS = 45_000;

/** `enabled` debe ser `status === "authenticated"` — sin sesión no hay nada que consultar. */
export function useNotifications(enabled: boolean) {
  const notifications = useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!enabled) {
      cache = [];
      hasLoaded = false;
      store.emit();
      return;
    }

    ensureLoaded();
    const timer = setInterval(() => {
      hasLoaded = false;
      ensureLoaded();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [enabled]);

  const refresh = useCallback(() => {
    hasLoaded = false;
    ensureLoaded();
  }, []);

  const markRead = useCallback(async (id: string) => {
    cache = cache.map((n) => (n.id === id ? { ...n, read: true } : n));
    store.emit();
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      // Si falla, se corrige solo en el siguiente refresh automático.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    cache = cache.map((n) => ({ ...n, read: true }));
    store.emit();
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // Idem.
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, refresh, markRead, markAllRead };
}
