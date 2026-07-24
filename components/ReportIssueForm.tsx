"use client";

import { useRef, useState, type DragEvent } from "react";
import { Wrench, PaintRoller, Wifi, MoreHorizontal, Camera, Send, Headset, MessageCircle, X, CheckCircle2 } from "lucide-react";

type Category = "maintenance" | "cleaning" | "internet" | "other";

const CATEGORIES: { id: Category; label: string; icon: typeof Wrench }[] = [
  { id: "maintenance", label: "Mantenimiento", icon: Wrench },
  { id: "cleaning", label: "Limpieza", icon: PaintRoller },
  { id: "internet", label: "Internet", icon: Wifi },
  { id: "other", label: "Otro", icon: MoreHorizontal },
];

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

interface ReservationOption {
  id: string;
  label: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ReportIssueForm({ reservations }: { reservations: ReservationOption[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reservationId, setReservationId] = useState(reservations[0]?.id ?? "");
  const [category, setCategory] = useState<Category>("maintenance");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_PHOTO_BYTES) {
        setError("Cada foto debe pesar máximo 5MB.");
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      setPhotos((prev) => (prev.length >= MAX_PHOTOS ? prev : [...prev, dataUrl]));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reservationId) {
      setError("Selecciona una reserva activa.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Cuéntanos con más detalle el inconveniente (mínimo 10 caracteres).");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/issue-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId, category, description: description.trim(), photos }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo enviar el reporte.");
      return;
    }

    setSuccess(true);
    setDescription("");
    setPhotos([]);
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <p className="text-on-surface font-bold mb-1">No tienes reservas activas</p>
        <p className="text-sm text-on-surface-variant">
          Necesitas una reserva confirmada o pendiente para poder reportar un problema.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <CheckCircle2 size={40} className="text-primary mx-auto mb-3" />
        <p className="text-on-surface font-bold mb-1">Reporte enviado</p>
        <p className="text-sm text-on-surface-variant mb-4">
          Nuestro equipo de soporte lo revisará y se pondrá en contacto contigo a la brevedad.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm font-bold text-primary underline underline-offset-2"
        >
          Reportar otro problema
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg shadow-card p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Selecciona tu reserva activa</label>
          <select
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
          >
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">Categoría del problema</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg border font-bold text-sm transition-colors ${
                    active
                      ? "bg-on-surface text-white border-on-surface"
                      : "bg-white border-outline/20 text-on-surface-variant hover:border-primary/40"
                  }`}
                >
                  <Icon size={20} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Descripción detallada</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Cuéntanos más sobre el inconveniente..."
            className="w-full px-4 py-3 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Evidencia fotográfica (Opcional)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 py-10 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-outline/30 hover:border-primary/40"
            }`}
          >
            <Camera size={22} className="text-on-surface-variant" />
            <p className="text-sm text-on-surface font-semibold">Arrastra tus fotos aquí o haz clic para subir</p>
            <p className="text-xs text-on-surface-variant">Formatos permitidos: JPG, PNG. Máx 5MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {photos.map((src, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Quitar foto"
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-on-surface/70 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
        >
          {loading ? "Enviando..." : "Enviar Reporte"} <Send size={16} />
        </button>
      </form>

      <aside className="space-y-4">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="font-bold text-on-surface mb-4">Información de Contacto</h2>
          <div className="flex items-start gap-3 mb-4">
            <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Headset size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-on-surface">Atención 24/7</p>
              <p className="text-xs text-on-surface-variant">Nuestro equipo responde en menos de 15 minutos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-on-surface">WhatsApp VIP</p>
              <a href="tel:+524811119463" className="text-xs text-on-surface-variant hover:text-primary">481 111 9463</a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Políticas de soporte</h3>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" /> Mantenimiento de emergencia inmediato.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" /> Compensación por pérdida de conectividad.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" /> Reubicación de oficina si es necesario.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
