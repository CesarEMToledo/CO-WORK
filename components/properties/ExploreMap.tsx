"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/map-markers";

function MapSkeleton() {
  return <div className="w-full h-full bg-sahara-container/60 animate-pulse" />;
}

// Leaflet's DOM APIs don't play well with SSR, so it's only pulled into the
// bundle client-side, the first time it's actually rendered.
const LeafletExploreMap = dynamic(
  () => import("./LeafletExploreMap").then((mod) => mod.LeafletExploreMap),
  { ssr: false, loading: MapSkeleton }
);

export interface ExploreMapProps {
  points: MapPoint[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

/**
 * Provider-agnostic map for /explorar. Today this always renders the
 * bundled Leaflet map (free, no API key, works out of the box).
 *
 * Google Maps support is already built in components/properties/GoogleExploreMap.tsx
 * (via @vis.gl/react-google-maps) but is intentionally NOT wired in here yet:
 * that package isn't installed, and importing it — even lazily via
 * next/dynamic — makes the bundler try to resolve it at build time, which
 * breaks the app for everyone until `npm install` has actually been run.
 *
 * To switch this file back to auto-picking Google Maps when a key is
 * configured, once `@vis.gl/react-google-maps` is installed:
 *
 *   const GoogleExploreMap = dynamic(
 *     () => import("./GoogleExploreMap").then((mod) => mod.GoogleExploreMap),
 *     { ssr: false, loading: MapSkeleton }
 *   );
 *
 *   export function ExploreMap(props: ExploreMapProps) {
 *     const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 *     if (apiKey) return <GoogleExploreMap {...props} apiKey={apiKey} />;
 *     return <LeafletExploreMap {...props} />;
 *   }
 */
export function ExploreMap(props: ExploreMapProps) {
  return <LeafletExploreMap {...props} />;
}
