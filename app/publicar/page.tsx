"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { usePublishedProperties } from "@/lib/use-published-properties";
import type { Property, PropertyCategory } from "@/data/mockProperties";
import { CATEGORIES } from "@/data/mockProperties";

const ALL_CATEGORIES: { id: PropertyCategory; label: string }[] = [
  ...CATEGORIES,
  { id: "Casa", label: "Casa" },
  { id: "Departamento", label: "Departamento" },
  { id: "Terreno", label: "Terreno" },
];

const ICON_OPTIONS: { id: string; label: string }[] = [
  { id: "king_bed", label: "Recámaras" },
  { id: "bathtub", label: "Baños" },
  { id: "square_foot", label: "Metros²" },
  { id: "pool", label: "Alberca" },
  { id: "waves", label: "Río / Cascada" },
  { id: "forest", label: "Selva" },
  { id: "terrain", label: "Terreno" },
  { id: "local_fire_department", label: "Fogata / Asador" },
  { id: "wb_sunny", label: "Terraza" },
  { id: "grass", label: "Jardín" },
  { id: "apartment", label: "Urbano" },
  { id: "star", label: "Destacado" },
];

interface SpecRow {
  icon: string;
  label: string;
}

export default function PublicarPage() {
  const router = useRouter();
  const { addProperty } = usePublishedProperties();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [operation, setOperation] = useState<"VENTA" | "RENTA">("RENTA");
  const [category, setCategory] = useState<PropertyCategory>("Cabaña");
  const [price, setPrice] = useState("");
  const [priceSuffix, setPriceSuffix] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<SpecRow[]>([
    { icon: "king_bed", label: "" },
    { icon: "bathtub", label: "" },
    { icon: "square_foot", label: "" },
  ]);
  const [error, setError] = useState("");

  const updateSpec = (idx: number, field: keyof SpecRow, value: string) => {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !location || !price || !imageUrl || !description) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    const property: Omit<Property, "id"> = {
      title,
      location,
      price,
      priceSuffix: priceSuffix || undefined,
      type: operation,
      category,
      description,
      imageUrl,
      specs: specs.filter((s) => s.label.trim() !== ""),
    };

    const created = addProperty(property);
    router.push(`/propiedad/${created.id}`);
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
            <label className="block text-sm font-bold text-on-surface mb-1.5">Ubicación *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Xilitla, SLP"
              className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Operación</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as "VENTA" | "RENTA")}
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
              <label className="block text-sm font-bold text-on-surface mb-1.5">Sufijo (opcional)</label>
              <input
                value={priceSuffix}
                onChange={(e) => setPriceSuffix(e.target.value)}
                placeholder="/noche, /mes, MXN"
                className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">URL de imagen *</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
            />
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
            <div className="space-y-2">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={spec.icon}
                    onChange={(e) => updateSpec(idx, "icon", e.target.value)}
                    className="w-full sm:w-40 sm:shrink-0 px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    value={spec.label}
                    onChange={(e) => updateSpec(idx, "label", e.target.value)}
                    placeholder="Ej. 2 Hab"
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors"
          >
            Publicar propiedad
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
