"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Property } from "@/data/mockProperties";
import { createListenerSet } from "./browser-store";

const PUBLISHED_KEY = "cw_published_properties";
const store = createListenerSet();
let cache: Property[] | null = null;

function readFromStorage(): Property[] {
  try {
    const raw = window.localStorage.getItem(PUBLISHED_KEY);
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): Property[] {
  if (!cache) cache = readFromStorage();
  return cache;
}

const EMPTY_PUBLISHED: Property[] = [];

function getServerSnapshot(): Property[] {
  return EMPTY_PUBLISHED;
}

export function usePublishedProperties() {
  const published = useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);

  const addProperty = useCallback((property: Omit<Property, "id">) => {
    const newProperty: Property = { ...property, id: `user-${Date.now()}` };
    const next = [newProperty, ...getSnapshot()];
    cache = next;
    window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(next));
    store.emit();
    return newProperty;
  }, []);

  return { published, addProperty };
}
