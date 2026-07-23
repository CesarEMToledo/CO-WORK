import { NextResponse } from "next/server";

// Convierte una dirección en texto ("Calle, Colonia, Localidad, Municipio...")
// a coordenadas (lat/lng) aproximadas, usando Nominatim — el buscador de
// direcciones gratuito de OpenStreetMap (no requiere ninguna llave de API).
//
// Ya no usamos Google Maps para esto: la geocodificación por texto (de
// cualquier proveedor, no solo Google) solo da un punto aproximado —
// suficiente para poner el mapa cerca del lugar correcto al empezar, pero la
// ubicación EXACTA siempre la da el usuario arrastrando el pin a mano (ver
// components/LocationPicker.tsx) o usando el GPS de su celular. Esta ruta
// solo calcula el punto de partida.
//
// Se llama desde el servidor (no directo desde el navegador) por la política
// de uso de Nominatim: exige mandar un User-Agent identificando la app, y
// llamarlo así evita problemas de CORS.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({ error: "Falta la dirección" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "mx");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
        // requires a real User-Agent identifying the application.
        "User-Agent": "CO-WORK-CiudadValles/1.0 (real estate listings app)",
        "Accept-Language": "es",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ coordinates: null, reason: "nominatim_error" });
    }

    const results = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    if (!results.length) {
      return NextResponse.json({ coordinates: null, reason: "ZERO_RESULTS" });
    }

    const { lat, lon, display_name } = results[0];
    return NextResponse.json({
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) },
      formattedAddress: display_name,
    });
  } catch {
    return NextResponse.json({ coordinates: null, reason: "network_error" });
  }
}
