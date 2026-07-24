"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ImageUploadField } from "@/components/ImageUploadField";
import { LocationPicker, type ResolvedAddress } from "@/components/LocationPicker";
import { EstadoMunicipioFields } from "@/components/EstadoMunicipioFields";
import { usePublishedProperties } from "@/lib/use-published-properties";
import type { PropertyCategory, PropertySpec } from "@/data/mockProperties";
import { CATEGORIES } from "@/data/mockProperties";
import { getYouTubeVideoId } from "@/lib/youtube";

const DEFAULT_ESTADO = "San Luis Potosí";

const ALL_CATEGORIES: { id: PropertyCategory; label: string }[] = [
  ...CATEGORIES,
  { id: "Casa", label: "Casa" },
  { id: "Departamento", label: "Departamento" },
  { id: "Terreno", label: "Terreno" },
  { id: "Oficina", label: "Oficina" },
  { id: "Rancho", label: "Rancho" },
];

// Every RENTA listing must say whether the price is per night, week, or month —
// no more ambiguous prices site-wide.
const RENTAL_PERIODS: { value: string; label: string }[] = [
  { value: "/noche", label: "Por noche" },
  { value: "/semana", label: "Por semana" },
  { value: "/mes", label: "Por mes" },
];

// Junta los campos de dirección en un solo texto para mostrar en las
// tarjetas y en la página de la propiedad.
function formatLocation(fields: {
  calle: string;
  numero: string;
  colonia: string;
  localidad: string;
  municipio: string;
  estado: string;
}): string {
  const { calle, numero, colonia, localidad, municipio, estado } = fields;
  const streetLine = [calle.trim(), numero.trim() ? `#${numero.trim()}` : null].filter(Boolean).join(" ");
  const parts = [streetLine, colonia.trim(), localidad.trim(), municipio.trim(), estado.trim()].filter(
    (part) => part && part.trim()
  );
  return parts.join(", ");
}

// La dirección completa que le mandamos al buscador de direcciones (Nominatim
// / OpenStreetMap) para tener un punto de partida en el mapa — igual que
// arriba pero agregando el país explícito, para no confundir el nombre de un
// municipio con otro lugar. Es solo un punto de partida aproximado; el pin
// final se ajusta a mano en el mapa (LocationPicker).
function formatAddressForGeocoding(fields: {
  calle: string;
  numero: string;
  colonia: string;
  localidad: string;
  municipio: string;
  estado: string;
}): string {
  return `${formatLocation(fields)}, México`;
}

export function PublicarForm() {
  const router = useRouter();
  const { addProperty } = usePublishedProperties();

  const [title, setTitle] = useState("");
  const [estado, setEstado] = useState(DEFAULT_ESTADO);
  const [municipio, setMunicipio] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [colonia, setColonia] = useState("");
  const [operation, setOperation] = useState<"VENTA" | "RENTA">("RENTA");
  const [category, setCategory] = useState<PropertyCategory>("Cabaña");
  const [price, setPrice] = useState("");
  const [priceSuffix, setPriceSuffix] = useState("/noche");
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareMeters, setSquareMeters] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const addressFields = { calle, numero, colonia, localidad, municipio, estado };

  // "Usar mi ubicación actual" también intenta adivinar estado/municipio y
  // el resto de la dirección — pero solo rellena lo que la persona no haya
  // escrito ya a mano, para no pisarle nada.
  const handleResolvedAddress = (resolved: ResolvedAddress) => {
    if (resolved.estado) setEstado(resolved.estado);
    if (resolved.municipio) setMunicipio(resolved.municipio);
    setLocalidad((prev) => (prev.trim() ? prev : resolved.localidad || prev));
    setCalle((prev) => (prev.trim() ? prev : resolved.calle || prev));
    setNumero((prev) => (prev.trim() ? prev : resolved.numero || prev));
    setColonia((prev) => (prev.trim() ? prev : resolved.colonia || prev));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !estado.trim() || !municipio.trim() || !calle.trim() || !price || !images.length || !description) {
      setError(
        "Completa todos los campos obligatorios (título, estado, municipio, calle, precio, descripción) y sube al menos una foto."
      );
      return;
    }
    if (operation === "RENTA" && !priceSuffix) {
      setError("Selecciona si el precio de renta es por noche, semana o mes.");
      return;
    }
    if (videoUrl.trim() && !getYouTubeVideoId(videoUrl.trim())) {
      setError("El link de video no parece ser un link válido de YouTube.");
      return;
    }

    setError("");
    setPublishing(true);

    // Si ya se ubicó/ajustó el pin en el mapa arriba (con la dirección, GPS,
    // o arrastrándolo a mano), usamos exactamente eso — nunca lo pisamos con
    // una nueva búsqueda. Solo si nadie tocó el mapa intentamos ubicarlo
    // automáticamente aquí, como respaldo.
    let finalCoordinates = coordinates;
    if (!finalCoordinates) {
      try {
        const res = await fetch(
          `/api/geocode?address=${encodeURIComponent(formatAddressForGeocoding(addressFields))}`
        );
        const data = await res.json();
        if (data.coordinates) finalCoordinates = data.coordinates;
      } catch {
        // Sin conexión al buscar coordenadas — no bloqueamos la publicación.
      }
    }

    const specs: PropertySpec[] = [];
    if (bedrooms.trim()) specs.push({ icon: "king_bed", label: bedrooms.trim() });
    if (bathrooms.trim()) specs.push({ icon: "bathtub", label: bathrooms.trim() });
    if (squareMeters.trim()) specs.push({ icon: "square_foot", label: `${squareMeters.trim()}m²` });

    try {
      const created = await addProperty({
        title,
        location: formatLocation(addressFields),
        estado: estado.trim(),
        municipio: municipio.trim(),
        localidad: localidad.trim() || undefined,
        calle: calle.trim(),
        numero: numero.trim() || undefined,
        colonia: colonia.trim() || undefined,
        price,
        priceSuffix: priceSuffix || undefined,
        type: operation,
        category,
        description,
        imageUrl: images[0],
        images: images.length > 1 ? images.slice(1) : undefined,
        specs,
        videoUrl: videoUrl.trim() || undefined,
        coordinates: finalCoordinates ?? undefined,
      });
      router.push(`/propiedad/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar la propiedad — intenta de nuevo.");
      setPublishing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Publicar propiedad</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Comparte tu propiedad con la comunidad de CO-WORK Ciudad Valles.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Cabaña Río Claro"
              className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Ubicación</label>
            <div className="space-y-3">
              <EstadoMunicipioFields
                estado={estado}
                municipio={municipio}
                onEstadoChange={setEstado}
                onMunicipioChange={setMunicipio}
              />

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Localidad</label>
                <input
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  placeholder="Ej. Ahuacatlán"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Calle *</label>
                  <input
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                    placeholder="Ej. Camino Río Claro"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Número</label>
                  <input
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="S/N"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Colonia o fraccionamiento
                </label>
                <input
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  placeholder="Ej. Centro (déjalo vacío si no aplica)"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 mb-3">
              Entre más completa la dirección, más cerca va a quedar el pin — pero lo que de verdad se guarda es
              donde quede el pin en el mapa de abajo, así que ajústalo si no cae exacto.
            </p>
            <LocationPicker
              address={formatAddressForGeocoding(addressFields)}
              canSearch={Boolean(municipio.trim() && calle.trim())}
              value={coordinates}
              onChange={setCoordinates}
              onResolvedAddress={handleResolvedAddress}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Operación</label>
              <select
                value={operation}
                onChange={(e) => {
                  const next = e.target.value as "VENTA" | "RENTA";
                  setOperation(next);
                  setPriceSuffix(next === "RENTA" ? "/noche" : "");
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="RENTA">Renta</option>
                <option value="VENTA">Venta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Precio *</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej. $2,800"
                className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              {operation === "RENTA" ? (
                <>
                  <label className="block text-sm font-bold text-on-surface mb-1.5">Periodo de renta *</label>
                  <select
                    value={priceSuffix}
                    onChange={(e) => setPriceSuffix(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
                  >
                    {RENTAL_PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-sm font-bold text-on-surface mb-1.5">Sufijo (opcional)</label>
                  <input
                    value={priceSuffix}
                    onChange={(e) => setPriceSuffix(e.target.value)}
                    placeholder="MXN"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Fotos *</label>
            <ImageUploadField value={images} onChange={setImages} />
            <p className="text-xs text-on-surface-variant mt-1.5">
              La primera foto que subas es la que se usa como portada — puedes cambiar el orden quitando y
              volviendo a subir.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Cuéntale a la comunidad qué hace especial a tu propiedad..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Características (opcional)</label>
            <div className={`grid gap-4 ${category === "Terreno" ? "grid-cols-1" : "grid-cols-3"}`}>
              {category !== "Terreno" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Recámaras</label>
                    <input
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      inputMode="decimal"
                      placeholder="Ej. 3"
                      className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Baños</label>
                    <input
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      inputMode="decimal"
                      placeholder="Ej. 2"
                      className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Metros²</label>
                <input
                  value={squareMeters}
                  onChange={(e) => setSquareMeters(e.target.value)}
                  inputMode="decimal"
                  placeholder="Ej. 250"
                  className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Video de YouTube (opcional)</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-xs text-on-surface-variant mt-1.5">
              Pega el link de un video en YouTube con el recorrido de la propiedad — no almacenamos archivos de
              video, solo el enlace.
            </p>
          </div>

          {error && <p className="text-sm font-medium text-error">{error}</p>}

          <button
            type="submit"
            disabled={publishing}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
          >
            {publishing ? "Publicando..." : "Publicar propiedad"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
