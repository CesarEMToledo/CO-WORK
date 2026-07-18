"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
  type PropertyFilters,
} from "./property-filters";

/**
 * Keeps PropertyFilters in sync with the URL's query string, so a filtered
 * /explorar view is shareable and survives a refresh/back-navigation —
 * without pulling in a routing/state library.
 */
export function useExploreFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  const setFilters = useCallback(
    (next: PropertyFilters) => {
      const qs = filtersToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const updateFilters = useCallback(
    (patch: Partial<PropertyFilters>) => setFilters({ ...filters, ...patch }),
    [filters, setFilters]
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [setFilters]);

  return { filters, setFilters, updateFilters, resetFilters };
}
