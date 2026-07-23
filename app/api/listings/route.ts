import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { listingToProperty } from "@/lib/listing-mapper";

const specSchema = z.object({ icon: z.string().min(1), label: z.string().min(1) });

const createSchema = z.object({
  title: z.string().trim().min(2, "El título debe tener al menos 2 caracteres").max(150),
  estado: z.string().trim().min(1, "El estado es obligatorio").max(60),
  municipio: z.string().trim().min(1, "El municipio es obligatorio").max(100),
  localidad: z.string().trim().max(100).optional().or(z.literal("")),
  calle: z.string().trim().min(1, "La calle es obligatoria").max(150),
  numero: z.string().trim().max(30).optional().or(z.literal("")),
  colonia: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().min(1).max(300),
  price: z.string().trim().min(1, "El precio es obligatorio").max(40),
  priceSuffix: z.string().trim().max(20).optional().or(z.literal("")),
  // El formulario manda el mismo shape "Property" que se usa en todo el
  // resto del sitio (campo `type`, no `operation`) — aquí solo se traduce
  // al nombre de columna de Prisma (`operation`) al guardar.
  type: z.enum(["VENTA", "RENTA"]),
  category: z.string().trim().min(1).max(40),
  description: z.string().trim().min(1, "La descripción es obligatoria").max(4000),
  specs: z.array(specSchema).max(10).default([]),
  imageUrl: z.string().url("La foto de portada no es una URL válida").max(2048),
  images: z.array(z.string().url().max(2048)).max(20).default([]),
  videoUrl: z.string().url("El link de video no es válido").max(2048).optional().or(z.literal("")),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

/**
 * Catálogo público de propiedades publicadas por usuarios — lo consumen
 * Home.tsx y ExplorePage.tsx (vía lib/use-published-properties.ts) para
 * mezclarlo con el catálogo estático de data/mockProperties.ts. Sin
 * protección de sesión a propósito: cualquiera que navegue el sitio (con o
 * sin cuenta) debe poder ver estas propiedades.
 */
export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true, phone: true } } },
  });

  return NextResponse.json({
    listings: listings.map((listing) => listingToProperty(listing, listing.owner)),
  });
}

/** Publicar una propiedad nueva — requiere haber iniciado sesión, para poder ligarla al usuario en "Mis propiedades". */
export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    const listing = await prisma.listing.create({
      data: {
        ownerId: session.user.id,
        title: data.title,
        location: data.location,
        estado: data.estado,
        municipio: data.municipio,
        localidad: data.localidad || null,
        calle: data.calle,
        numero: data.numero || null,
        colonia: data.colonia || null,
        lat: data.coordinates?.lat ?? null,
        lng: data.coordinates?.lng ?? null,
        price: data.price,
        priceSuffix: data.priceSuffix || null,
        operation: data.type,
        category: data.category,
        description: data.description,
        specs: data.specs,
        imageUrl: data.imageUrl,
        images: data.images,
        videoUrl: data.videoUrl || null,
      },
      include: { owner: { select: { name: true, phone: true } } },
    });

    return NextResponse.json(
      { listing: listingToProperty(listing, listing.owner) },
      { status: 201 }
    );
  } catch (err) {
    // Si esto truena (p. ej. porque se agregó una columna nueva al schema y
    // el servidor de Next.js no se reinició después de "prisma migrate
    // dev" — el cliente de Prisma queda cargado en memoria con el schema
    // viejo hasta que se reinicia el proceso), mandamos el motivo real al
    // navegador en vez de dejar que Next devuelva una página de error sin
    // JSON (lo cual hacía que el formulario solo mostrara "intenta de
    // nuevo" sin ninguna pista real).
    console.error("Error al crear la propiedad en la base de datos:", err);
    return NextResponse.json(
      {
        error: `No se pudo guardar en la base de datos: ${
          err instanceof Error ? err.message : "error desconocido"
        }`,
      },
      { status: 500 }
    );
  }
}
