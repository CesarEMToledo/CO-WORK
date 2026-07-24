"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";

const BUCKET = "property-photos";
const MAX_IMAGES = 8;
// Este es el límite del ARCHIVO ORIGINAL que aceptamos (antes de comprimir) —
// una foto de celular sin editar puede pesar esto fácilmente. Ya comprimida
// va a pesar mucho menos (normalmente unos cientos de KB).
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

interface ImageUploadFieldProps {
  /** URLs públicas ya subidas, en orden. La primera es la foto de portada. */
  value: string[];
  onChange: (urls: string[]) => void;
}

// Selector de fotos "normal": arrastra o elige archivos desde tu celular o
// computadora, se suben solos a Supabase Storage y aquí solo se guardan las
// URLs públicas resultantes. Reemplaza al viejo campo de "pega la URL de la
// imagen", que era muy complicado para alguien sin experiencia técnica.
export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      setError("");

      const room = MAX_IMAGES - value.length;
      if (room <= 0) {
        setError(`Ya tienes el máximo de ${MAX_IMAGES} fotos.`);
        return;
      }

      const toUpload = list.slice(0, room);
      if (list.length > room) {
        setError(`Solo se agregaron ${room} foto(s) — el máximo es ${MAX_IMAGES}.`);
      }

      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          setError("Solo se aceptan imágenes (jpg, png, webp, gif).");
          return;
        }
        if (file.size > MAX_SIZE_BYTES) {
          setError("Cada foto debe pesar menos de 20MB.");
          return;
        }
      }

      setUploading(true);
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of toUpload) {
        // Reducimos peso/tamaño antes de subir — se ven prácticamente igual
        // pero ocupan mucho menos espacio en Supabase Storage.
        const upload = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });

        const ext = upload.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, upload, { contentType: upload.type });

        if (uploadError) {
          setError("No se pudo subir una de las fotos. Intenta de nuevo.");
          continue;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setUploading(false);
      if (uploaded.length) onChange([...value, ...uploaded]);
    },
    [value, onChange]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-outline/25 hover:border-primary/60 bg-white"
        }`}
      >
        {uploading ? (
          <Loader2 size={28} className="text-primary animate-spin" />
        ) : (
          <ImagePlus size={28} className="text-on-surface-variant" />
        )}
        <p className="text-sm font-bold text-on-surface">
          {uploading ? "Subiendo foto(s)..." : "Arrastra tus fotos aquí o haz clic para elegirlas"}
        </p>
        <p className="text-xs text-on-surface-variant">
          JPG, PNG, WEBP o GIF. Hasta {MAX_IMAGES} fotos — las optimizamos automáticamente al subirlas.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm font-medium text-error">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-outline/15 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                  Portada
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Quitar foto"
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
