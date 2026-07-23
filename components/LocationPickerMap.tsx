"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Mismo pin que se usa en la página de la propiedad (PropertyMap.tsx), para
// que se vea consistente.
const pinIcon = L.divIcon({
  className: "cw-map-pin",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.61 26.39 0 17 0z" fill="#c2652a"/>
      <circle cx="17" cy="17" r="7" fill="#ffffff"/>
    </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
});

const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface LocationPickerMapProps {
  center: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
  /** Cambia cada vez que el cambio de coordenadas vino de una búsqueda/GPS
   * (no de arrastrar o hacer clic), para saber cuándo sí recentrar el mapa. */
  recenterToken: number;
}

// Cuando el pin se mueve por una búsqueda de dirección o por GPS, centra el
// mapa ahí y acerca el zoom. Se dispara solo cuando `recenterToken` cambia
// (ver LocationPicker.tsx) — NO cuando el usuario arrastra o hace clic, para
// no pelearse con su gesto ni "brincar" el mapa cada vez que ajusta el pin a
// mano.
function Recenter({ center, recenterToken }: { center: { lat: number; lng: number }; recenterToken: number }) {
  const map = useMap();
  useEffect(() => {
    if (recenterToken === 0) return;
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 16));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterToken]);

  // Los mapas de Leaflet montados dentro de contenedores que aparecen
  // dinámicamente (como este, cargado con next/dynamic) a veces calculan mal
  // su tamaño interno al iniciar, lo que hace que arrastrar el pin se sienta
  // "trabado" o que no se mueva como se espera. Forzar un recálculo poco
  // después de montar arregla eso sin afectar nada visible cuando ya estaba
  // bien.
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(id);
  }, [map]);

  return null;
}

function ClickToPlace({ onChangeRef }: { onChangeRef: RefObject<(coords: { lat: number; lng: number }) => void> }) {
  // Igual que con el marcador: el objeto de handlers se manda una sola vez
  // (deps vacíos) y lee la función más reciente desde una ref, para que
  // react-leaflet no desconecte/reconecte el listener del mapa en cada
  // render del formulario.
  const handlers = useMemo(
    () => ({
      click(e: { latlng: { lat: number; lng: number } }) {
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useMapEvents(handlers);
  return null;
}

export function LocationPickerMap({ center, onChange, recenterToken }: LocationPickerMapProps) {
  const markerRef = useRef<LeafletMarker>(null);

  // `onChange` (en realidad `setCoordinates` de useState) ya es estable de
  // por sí, pero lo guardamos también en una ref por seguridad — así, sin
  // importar si algún día deja de ser estable, el objeto de eventos del
  // marcador (más abajo) nunca se vuelve a crear y el arrastre del pin no se
  // rompe.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // IMPORTANTE: si este objeto se vuelve a crear en cada render (por ejemplo
  // por escribir en cualquier otro campo del formulario, lo que re-renderiza
  // todo el árbol de React aunque el mapa no haya cambiado), react-leaflet
  // desconecta y reconecta los eventos del marcador cada vez — y eso es
  // justo lo que rompe el arrastre del pin en la práctica. Al memorizarlo con
  // useMemo (con un arreglo de dependencias vacío) el objeto se crea una sola
  // vez, así los eventos del marcador quedan estables sin importar cuántas
  // veces se re-renderice el formulario.
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;
        const pos = marker.getLatLng();
        onChangeRef.current({ lat: pos.lat, lng: pos.lng });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <Recenter center={center} recenterToken={recenterToken} />
      <ClickToPlace onChangeRef={onChangeRef} />
      <Marker ref={markerRef} position={[center.lat, center.lng]} icon={pinIcon} draggable eventHandlers={eventHandlers} />
    </MapContainer>
  );
}
