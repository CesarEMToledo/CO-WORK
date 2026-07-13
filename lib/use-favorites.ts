"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createListenerSet } from "./browser-store";

const FAVORITES_KEY = "cw_favorites";
const store = createListenerSet();
let cache: Set<string> | null = null;

function readFromStorage(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function getSnapshot(): Set<string> {
  if (!cache) cache = readFromStorage();
  return cache;
}

const EMPTY_FAVORITES = new Set<string>();

function getServerSnapshot(): Set<string> {
  return EMPTY_FAVORITES;
}

export function useFavorites() {
  const favorites = useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);

  const toggleFavorite = useCallback((id: string) => {
    const next = new Set(getSnapshot());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    cache = next;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
    store.emit();
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
