"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ImageUploadField } from "@/components/ImageUploadField";
import { LocationPicker, type ResolvedAddress } from "@/components/LocationPicker";
import { EstadoMunicipioFields } from "@/components/EstadoMunicipioFields";
import type { OwnedListing } from "./types";

interface ListingEditFormProps {
  listing: OwnedListing;
  onSaved: (updated: OwnedListing) => void;
  onCancel: () => void;
}

const RENTAL_PERIODS: { value: string; label: string }[] = [
  { value: "/noche", label: "Por noche" },
  { value: "/semana", label: "Por semana" },
  { value: "/mes", label: "Por mes" },
];

/** Edita los datos de una propiedad ya publicada — el mismo formulario que /publicar, pero mandando PATCH. */
export function ListingEditForm({ listing, onSaved, onCancel }: ListingEditFormProps) {
  const [title, setTitle] = useState(listing.title);
  const [estado, setEstado] = useState(listing.estado ?? "San Luis Potosí");
  const [municipio, setMunicipio] = useState(listing.municipio ?? "");
  const [localidad, setLocalidad] = useState(listing.localidad ?? "");
  const [calle, setCalle] = useState(listing.calle ?? "");
  const [numero, setNumero] = useState(listing.numero ?? "");
  const [colonia, setColonia] = useState(listing.colonia ?? "");
  const [price, setPrice] = useState(listing.price);
  const [priceSuffix, setPriceSuffix] = useState(listing.priceSuffix ?? "");
  const [description, setDescription] = useState(listing.description);
  const [images, setImages] = useState<string[]>(
    listing.images && listing.images.length > 0 ? [listing.imageUrl, ...listing.images] : [listing.imageUrl]
  );
  const [videoUrl, setVideoUrl] = useState(listing.videoUrl ?? "");
  const [coordinates, setCoordinates] = useState(listing.coordinates ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // "Usar mi ubicación actual" también intenta adivinar estado/municipio y
  // el resto de la dirección — pero solo rellena lo que no esté ya escrito,
  // para no pisarle nada a lo que ya tenía la propiedad.
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
    if (
      !title.trim() ||
      !estado.trim() ||
      !municipio.trim() ||
      !calle.trim() ||
      !price.trim() ||
      !description.trim() ||
      !images.length
    ) {
      setError("Completa título, estado, municipio, calle, precio, descripción y al menos una foto.");
      return;
    }

    setSaving(true);
    setError("");

    const streetLine = [calle.trim(), numero.trim() ? `#${numero.trim()}` : null].filter(Boolean).join(" ");
    const location = [streetLine, colonia.trim(), localidad.trim(), municipio.trim(), estado.trim()]
      .filter((part) => part && part.trim())
      .join(", ");

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          estado: estado.trim(),
          municipio: municipio.trim(),
          localidad: localidad.trim() || null,
          calle: calle.trim(),
          numero: numero.trim() || null,
          colonia: colonia.trim() || null,
          location,
          price: price.trim(),
          priceSuffix: priceSuffix || null,
          description: description.trim(),
          imageUrl: images[0],
          images: images.slice(1),
          videoUrl: videoUrl.trim() || null,
          coordinates: coordinates ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar — intenta de nuevo.");

      onSaved({ ...listing, ...data.listing, estado, municipio, localidad, calle, numero, colonia });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar — intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-sahara-container/40 rounded-lg p-4">
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <EstadoMunicipioFields
        estado={estado}
        municipio={municipio}
        onEstadoChange={setEstado}
        onMunicipioChange={setMunicipio}
        size="sm"
      />

      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Localidad</label>
        <input
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">Calle</label>
          <input
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">Número</label>
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Colonia o fraccionamiento</label>
        <input
          value={colonia}
          onChange={(e) => setColonia(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Ajustar el pin en el mapa</label>
        <LocationPicker
          address={`${calle}, ${colonia}, ${localidad}, ${municipio}, ${estado}, México`}
          canSearch={Boolean(municipio.trim() && calle.trim())}
          value={coordinates}
          onChange={setCoordinates}
          onResolvedAddress={handleResolvedAddress}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">Precio</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          {listing.type === "RENTA" ? (
            <>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Periodo</label>
              <select
                value={priceSuffix}
                onChange={(e) => setPriceSuffix(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                {RENTAL_PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Sufijo</label>
              <input
                value={priceSuffix}
                onChange={(e) => setPriceSuffix(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Fotos</label>
        <ImageUploadField value={images} onChange={setImages} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Video de YouTube (opcional)</label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-outline/20 text-on-surface font-bold text-sm rounded-lg hover:bg-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
