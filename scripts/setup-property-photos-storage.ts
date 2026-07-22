// Script de un solo uso: crea el bucket de Supabase Storage donde se
// guardan las fotos que la gente sube al publicar una propiedad (renta o
// venta), y la política que permite subirlas.
//
// A diferencia del bucket de "avatars" (donde cada usuario solo puede tocar
// su propia foto), publicar una propiedad NO requiere iniciar sesión en este
// sitio, así que este bucket permite que cualquiera suba fotos — igual que
// ya podía "publicar" sin cuenta antes de este cambio. Cualquiera puede
// verlas (bucket público para lectura).
//
// Corre esto UNA VEZ por proyecto de Supabase:
//
//   npx tsx scripts/setup-property-photos-storage.ts
//
// Es seguro volver a correrlo (no duplica el bucket ni las políticas).
import { config as loadEnv } from "dotenv";

loadEnv();
loadEnv({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { createAdminClient } from "../lib/supabase/admin";

const BUCKET = "property-photos";

async function main() {
  const admin = createAdminClient();

  const { data: existing } = await admin.storage.getBucket(BUCKET);
  if (!existing) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024, // 8MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    });
    if (error) throw error;
    console.log(`Bucket "${BUCKET}" creado.`);
  } else {
    console.log(`Bucket "${BUCKET}" ya existía, no se tocó.`);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const statements = [
    `drop policy if exists "property_photos_public_read" on storage.objects;`,
    `create policy "property_photos_public_read" on storage.objects for select using (bucket_id = '${BUCKET}');`,
    `drop policy if exists "property_photos_public_insert" on storage.objects;`,
    `create policy "property_photos_public_insert" on storage.objects for insert with check (bucket_id = '${BUCKET}');`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("Políticas de acceso al bucket configuradas.");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
