"use client";

import { useEffect, useMemo } from "react";
import { APIProvider, AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import type { MapPoint } from "@/lib/map-markers";
import { getMapBounds } from "@/lib/map-markers";

function FitToPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;
    const bounds = getMapBounds(points);
    if (!bounds) return;

    if (points.length === 1) {
      map.setCenter({ lat: points[0].lat, lng: points[0].lng });
      map.setZoom(13);
      return;
    }
    map.fitBounds(
      { north: bounds.maxLat, south: bounds.minLat, east: bounds.maxLng, west: bounds.minLng },
      64
    );
    // Only re-fit when the set of points actually changes (filters applied),
    // not on every hover/select — the map shouldn't jump while browsing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points.map((p) => p.id).join(",")]);

  return null;
}

interface GoogleExploreMapProps {
  points: MapPoint[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  apiKey: string;
}

export function GoogleExploreMap({ points, selectedId, hoveredId, onSelect, onHover, apiKey }: GoogleExploreMapProps) {
  const fallbackCenter = { lat: 21.9833, lng: -99.0139 }; // Ciudad Valles, SLP
  const initialCenter = useMemo(() => (points[0] ? { lat: points[0].lat, lng: points[0].lng } : fallbackCenter), [points]);

  // Advanced markers need a Map ID. "DEMO_MAP_ID" is Google's own stand-in
  // for local/demo use — set NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID once you create
  // a real one in Cloud Console > Map Management for custom vector styling.
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={mapId}
        defaultCenter={initialCenter}
        defaultZoom={11}
        gestureHandling="greedy"
        mapTypeControl
        streetViewControl
        fullscreenControl={false}
        className="w-full h-full"
      >
        <FitToPoints points={points} />
        {points.map((point) => {
          const active = point.id === selectedId || point.id === hoveredId;
          return (
            <AdvancedMarker
              key={point.id}
              position={{ lat: point.lat, lng: point.lng }}
              onClick={() => onSelect(point.id)}
              zIndex={active ? 10 : 1}
            >
              <div
                onMouseEnter={() => onHover(point.id)}
                onMouseLeave={() => onHover(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-on-surface shadow-card border border-outline/10"
                }`}
              >
                {point.price}
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
}
