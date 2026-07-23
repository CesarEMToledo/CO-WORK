import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { listingToProperty } from "@/lib/listing-mapper";

const specSchema = z.object({ icon: z.string().min(1), label: z.string().min(1) });

// Todos los campos opcionales — PATCH solo actualiza lo que se manda.
const updateSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  estado: z.string().trim().min(1).max(60).optional(),
  municipio: z.string().trim().min(1).max(100).optional(),
  localidad: z.string().trim().max(100).nullable().optional(),
  calle: z.string().trim().min(1).max(150).optional(),
  numero: z.string().trim().max(30).nullable().optional(),
  colonia: z.string().trim().max(100).nullable().optional(),
  location: z.string().trim().min(1).max(300).optional(),
  price: z.string().trim().min(1).max(40).optional(),
  priceSuffix: z.string().trim().max(20).nullable().optional(),
  category: z.string().trim().min(1).max(40).optional(),
  description: z.string().trim().min(1).max(4000).optional(),
  specs: z.array(specSchema).max(10).optional(),
  imageUrl: z.string().url().max(2048).optional(),
  images: z.array(z.string().url().max(2048)).max(20).optional(),
  videoUrl: z.string().url().max(2048).nullable().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(),
  status: z.enum(["disponible", "vendida", "rentada", "no_disponible"]).optional(),
});

async function getOwnedListing(id: string, ownerId: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { listing: null, forbidden: false };
  if (listing.ownerId !== ownerId) return { listing: null, forbidden: true };
  return { listing, forbidden: false };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { name: true, phone: true } } },
  });
  if (!listing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  return NextResponse.json({ listing: listingToProperty(listing, listing.owner) });
}

/** Editar una propiedad publicada — solo el dueño puede hacerlo (incluye cambiar el status). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const { listing: existing, forbidden } = await getOwnedListing(id, session.user.id);
  if (forbidden) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!existing) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.municipio !== undefined && { municipio: data.municipio }),
        ...(data.localidad !== undefined && { localidad: data.localidad || null }),
        ...(data.calle !== undefined && { calle: data.calle }),
        ...(data.numero !== undefined && { numero: data.numero || null }),
        ...(data.colonia !== undefined && { colonia: data.colonia || null }),
        ...(data.coordinates !== undefined && {
          lat: data.coordinates?.lat ?? null,
          lng: data.coordinates?.lng ?? null,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.priceSuffix !== undefined && { priceSuffix: data.priceSuffix || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.specs !== undefined && { specs: data.specs }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: { owner: { select: { name: true, phone: true } } },
    });

    return NextResponse.json({ listing: listingToProperty(listing, listing.owner) });
  } catch (err) {
    console.error("Error al actualizar la propiedad en la base de datos:", err);
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
