"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LocateFixed, Loader2, MapPin } from "lucide-react";

function MapSkeleton() {
  return <div className="w-full h-full bg-sahara-container/60 animate-pulse rounded-lg" />;
}

// Leaflet no funciona bien renderizado en el servidor, así que solo se carga
// en el navegador, la primera vez que se muestra.
const LocationPickerMap = dynamic(
  () => import("./LocationPickerMap").then((mod) => mod.LocationPickerMap),
  { ssr: false, loading: MapSkeleton }
);

const DEFAULT_CENTER = { lat: 21.9833, lng: -99.0139 }; // Ciudad Valles, SLP

export interface ResolvedAddress {
  estado: string | null;
  municipio: string | null;
  localidad: string;
  calle: string;
  numero: string;
  colonia: string;
}

interface LocationPickerProps {
  /** Dirección completa (municipio, calle, etc.) que se manda a buscar en el mapa. */
  address: string;
  /** Si ya hay lo mínimo (municipio y calle) para poder buscarla. */
  canSearch: boolean;
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  /**
   * Si se manda, al usar "Usar mi ubicación actual" (GPS) también se intenta
   * adivinar estado/municipio/localidad/calle/colonia a partir de las
   * coordenadas, para prellenar el resto del formulario — útil cuando quien
   * publica está parado en la propiedad. `municipio`/`estado` vienen en
   * `null` si no se pudo emparejar con el catálogo conocido (se deja para
   * que el formulario lo pida a mano en ese caso).
   */
  onResolvedAddress?: (address: ResolvedAddress) => void;
}

// El pin del mapa siempre se guarda como las coordenadas REALES de la
// propiedad — no depende de qué tan bien el buscador de direcciones (OSM/
// Nominatim, gratuito) entendió el texto escrito. Primero se intenta ubicar
// automáticamente con la dirección — esto da solo un punto de partida
// aproximado — y luego se AJUSTA A MANO arrastrando el pin, haciendo clic en
// el lugar correcto, o usando el GPS del celular si se está en el lugar. Lo
// que realmente se guarda en la propiedad es donde quede el pin, nunca el
// texto de la dirección.
export function LocationPicker({ address, canSearch, value, onChange, onResolvedAddress }: LocationPickerProps) {
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  // Solo se incrementa cuando el cambio de coordenadas viene de "Ubicar con
  // la dirección" o del GPS — nunca cuando el usuario arrastra el pin o hace
  // clic en el mapa. LocationPickerMap usa esto para saber cuándo sí debe
  // recentrarse/acercar el zoom, y cuándo debe quedarse quieto para no
  // pelearse con el gesto de arrastrar.
  const [recenterToken, setRecenterToken] = useState(0);

  const center = value ?? DEFAULT_CENTER;

  const handleSearch = async () => {
    setError("");
    setNotFound(false);
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.coordinates) {
        onChange(data.coordinates);
        setRecenterToken((n) => n + 1);
      } else {
        setNotFound(true);
      }
    } catch {
      setError("No se pudo buscar la dirección — revisa tu conexión e intenta de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta ubicación por GPS.");
      return;
    }
    setError("");
    setNotFound(false);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(coords);
        setRecenterToken((n) => n + 1);

        if (!onResolvedAddress) {
          setLocating(false);
          return;
        }

        // Intentamos adivinar el resto de la dirección a partir de las
        // coordenadas — si falla (sin internet, Nominatim no responde,
        // etc.) no es un error real: el pin ya quedó puesto, solo no se
        // prellenan los demás campos y la persona los llena a mano.
        fetch(`/api/geocode/reverse?lat=${coords.lat}&lng=${coords.lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.address) {
              onResolvedAddress(data.address as ResolvedAddress);
            }
          })
          .catch(() => {
            // Silencioso — ver comentario arriba.
          })
          .finally(() => setLocating(false));
      },
      () => {
        setLocating(false);
        setError("No se pudo obtener tu ubicación — revisa los permisos de ubicación del navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !canSearch}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline/20 bg-white text-xs font-bold text-on-surface hover:bg-sahara-container disabled:opacity-50 transition-colors"
        >
          {searching ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          {searching ? "Buscando..." : "Ubicar con la dirección"}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline/20 bg-white text-xs font-bold text-on-surface hover:bg-sahara-container disabled:opacity-50 transition-colors"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
          {locating ? "Obteniendo ubicación..." : "Usar mi ubicación actual (si estás ahí)"}
        </button>
      </div>

      <div className="w-full h-56 rounded-lg overflow-hidden border border-outline/15">
        <LocationPickerMap center={center} onChange={onChange} recenterToken={recenterToken} />
      </div>

      {notFound && (
        <p className="text-sm font-medium text-warning">
          No encontramos esa dirección en el mapa (pasa seguido en zonas rurales — el buscador gratuito de
          direcciones no siempre tiene todas las calles) — arrastra el pin o haz clic en el punto correcto para
          ubicarlo tú mismo.
        </p>
      )}
      {error && <p className="text-sm font-medium text-error">{error}</p>}
      <p className="text-xs text-on-surface-variant">
        <strong>Arrastra el pin o haz clic en el mapa para dejarlo exactamente en el lugar</strong> — la dirección
        escrita solo ayuda a acercar el mapa al área correcta, pero lo que se guarda de verdad es dónde quede el
        pin. Si conoces el lugar de memoria, puedes ignorar los botones de arriba y colocar el pin directo.
      </p>
    </div>
  );
}
