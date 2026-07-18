"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/map-markers";
import { getMapBounds } from "@/lib/map-markers";

// Free, no-API-key basemap with a muted palette closer to the app's earthy
// brand than default OpenStreetMap tiles. Swap for Mapbox/Google by setting
// the relevant env var — see ExploreMap.tsx for how providers are picked.
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_PIN_CLASSES =
  "px-3 py-1.5 rounded-full bg-white text-on-surface text-xs font-extrabold shadow-card border border-outline/10 whitespace-nowrap";
const ACTIVE_PIN_CLASSES =
  "px-3 py-1.5 rounded-full bg-primary text-white text-xs font-extrabold shadow-lg whitespace-nowrap";
const PIN_HEIGHT = 28;

// Leaflet needs a concrete icon box to anchor + hit-test a marker; there's no
// way to measure real text width outside the DOM, so this estimates the pill's
// rendered size from the price string. Slightly over-estimating is safe (the
// icon container isn't clipped — see .cw-price-pin in globals.css) but keeping
// it close avoids off-center anchoring.
function estimatePinWidth(price: string): number {
  return Math.max(48, Math.round(price.length * 7.4) + 26);
}

function buildPinIcon(price: string, active: boolean) {
  const classes = active ? ACTIVE_PIN_CLASSES : DEFAULT_PIN_CLASSES;
  const width = estimatePinWidth(price);
  return L.divIcon({
    className: "cw-price-pin",
    html: `<div class="${classes}">${price}</div>`,
    iconSize: [width, PIN_HEIGHT],
    iconAnchor: [width / 2, PIN_HEIGHT / 2],
  });
}

interface PriceMarkerProps {
  point: MapPoint;
  active: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

// A dedicated component (rather than building the icon inline in a .map())
// so useMemo can skip rebuilding a marker's icon when its own price/active
// state hasn't changed, instead of every marker churning a new L.DivIcon on
// every hover anywhere on the map.
function PriceMarker({ point, active, onSelect, onHover }: PriceMarkerProps) {
  const icon = useMemo(() => buildPinIcon(point.price, active), [point.price, active]);

  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={icon}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(point.id),
        mouseover: () => onHover(point.id),
        mouseout: () => onHover(null),
      }}
    />
  );
}

function FitToPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = getMapBounds(points);
    if (!bounds) return;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    } else {
      map.fitBounds(
        [
          [bounds.minLat, bounds.minLng],
          [bounds.maxLat, bounds.maxLng],
        ],
        { padding: [48, 48] }
      );
    }
    // Only re-fit when the set of points actually changes (filters applied),
    // not on every hover/select — the map shouldn't jump while browsing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.map((p) => p.id).join(",")]);

  return null;
}

interface LeafletExploreMapProps {
  points: MapPoint[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

export function LeafletExploreMap({ points, selectedId, hoveredId, onSelect, onHover }: LeafletExploreMapProps) {
  const fallbackCenter: [number, number] = [21.9833, -99.0139]; // Ciudad Valles, SLP

  return (
    <MapContainer
      center={points[0] ? [points[0].lat, points[0].lng] : fallbackCenter}
      zoom={11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <FitToPoints points={points} />
      {points.map((point) => (
        <PriceMarker
          key={point.id}
          point={point}
          active={point.id === selectedId || point.id === hoveredId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </MapContainer>
  );
}
