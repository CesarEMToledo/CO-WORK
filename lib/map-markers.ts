import type { Property } from "@/data/mockProperties";
import { getCoordinatesForProperty } from "./property-details";

/**
 * A property projected onto the map: just the fields either map
 * implementation (Google or Leaflet) needs to draw a price-pill marker.
 * Keeping this separate from `Property` means ExploreMap.tsx and its two
 * backends don't need to know anything about the wider catalog shape.
 */
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  location: string;
  price: string;
  type: Property["type"];
}

export function toMapPoint(property: Property): MapPoint {
  const { lat, lng } = getCoordinatesForProperty(property);
  return {
    id: property.id,
    lat,
    lng,
    title: property.title,
    location: property.location,
    price: property.price,
    type: property.type,
  };
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function getMapBounds(points: MapPoint[]): MapBounds | null {
  if (points.length === 0) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return { minLat, maxLat, minLng, maxLng };
}
