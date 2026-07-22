"use client";

// Comprime/redimensiona una foto ANTES de subirla, para que ocupe mucho
// menos espacio en Supabase Storage sin que se note la diferencia a simple
// vista. Se usa tanto para la foto de perfil como para las fotos de
// propiedades.
//
// Cómo lo logra:
// 1. Si la foto es más grande que el máximo permitido, la reduce (mantiene
//    la proporción) — la mayoría del "peso" de una foto de celular viene de
//    tener 3000-4000px de ancho cuando en la página nunca se ve a más de
//    unos cientos/algunos miles de px.
// 2. La reconvierte a WebP, que a la misma calidad visual pesa mucho menos
//    que JPG o PNG.
// 3. Si por lo que sea el resultado saliera más pesado que el original (pasa
//    con imágenes ya muy comprimidas), se sube el original sin tocar.
// 4. Los GIF no se toca — el proceso los aplanaría a una sola imagen fija y
//    perderían la animación.

export interface CompressImageOptions {
  /** Ancho máximo en px. Si la foto es más chica, no se agranda. */
  maxWidth?: number;
  /** Alto máximo en px. */
  maxHeight?: number;
  /** Calidad de 0 a 1. 0.82-0.9 no se distingue de la original a simple vista. */
  quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
};

export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<File> {
  if (typeof window === "undefined" || file.type === "image/gif") {
    return file;
  }

  const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

  try {
    const source = await loadImageSource(file);
    const sourceWidth = "naturalWidth" in source ? source.naturalWidth : source.width;
    const sourceHeight = "naturalHeight" in source ? source.naturalHeight : source.height;

    const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if ("close" in source) source.close();

    if (!blob || blob.size >= file.size) {
      // No valió la pena (el original ya estaba chico/comprimido) — se sube
      // el original tal cual.
      return file;
    }

    const newName = file.name.replace(/\.[^./]+$/, "") + ".webp";
    return new File([blob], newName, { type: "image/webp", lastModified: Date.now() });
  } catch {
    // Si algo falla (navegador viejo, foto corrupta, etc.) mejor subir el
    // original que bloquear al usuario.
    return file;
  }
}

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Sigue con el método de <img> abajo.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
