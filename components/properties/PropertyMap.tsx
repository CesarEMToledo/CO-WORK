"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Self-contained SVG pin (no external icon assets to fetch) in the app's brand orange.
const pinIcon = L.divIcon({
  className: "cw-map-pin",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.61 26.39 0 17 0z" fill="#c2652a"/>
      <circle cx="17" cy="17" r="7" fill="#ffffff"/>
    </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -38],
});

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
  location: string;
}

export function PropertyMap({ lat, lng, title, location }: PropertyMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={pinIcon}>
        <Popup>
          <strong>{title}</strong>
          <br />
          {location}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
