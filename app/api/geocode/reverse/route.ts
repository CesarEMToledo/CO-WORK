import { NextResponse } from "next/server";
import { ESTADOS, getMunicipios } from "@/data/mexico-geo";

// Convierte coordenadas (lat/lng, normalmente del GPS del celular) en
// componentes de dirección — usado para prellenar el formulario de publicar
// cuando alguien está parado en la propiedad y usa "Usar mi ubicación
// actual". Mismo proveedor gratuito que la búsqueda por texto
// (app/api/geocode/route.ts): Nominatim/OpenStreetMap.
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function matchEstado(rawState: string | undefined): string | null {
  if (!rawState) return null;
  const target = normalize(rawState);
  return ESTADOS.find((e) => normalize(e) === target) ?? null;
}

function matchMunicipio(estado: string | null, ...candidates: (string | undefined)[]): string | null {
  if (!estado) return null;
  const municipios = getMunicipios(estado);
  for (const candidate of candidates) {
    if (!candidate) continue;
    const target = normalize(candidate);
    const found = municipios.find((m) => normalize(m) === target);
    if (found) return found;
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Faltan lat/lng" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "CO-WORK-CiudadValles/1.0 (real estate listings app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ address: null, reason: "nominatim_error" });
    }

    const data = (await res.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};

    const estado = matchEstado(a.state);
    const municipio = matchMunicipio(estado, a.municipality, a.county, a.city, a.town);
    const localidad = a.village || a.town || a.city || a.hamlet || "";
    const calle = a.road || "";
    const numero = a.house_number || "";
    const colonia = a.neighbourhood || a.suburb || a.quarter || "";

    return NextResponse.json({
      address: { estado, municipio, localidad, calle, numero, colonia },
    });
  } catch {
    return NextResponse.json({ address: null, reason: "network_error" });
  }
}
