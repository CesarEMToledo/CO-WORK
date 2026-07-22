// Script de un solo uso: crea el bucket de Supabase Storage donde se
// guardan las fotos de perfil, y las políticas (RLS) para que cada usuario
// solo pueda subir/borrar su propia foto, aunque cualquiera pueda verla.
//
// Corre esto UNA VEZ por proyecto de Supabase (ya sea el compartido del
// equipo, o el tuyo si estás desarrollando por tu cuenta):
//
//   npx tsx scripts/setup-avatars-storage.ts
//
// Es seguro volver a correrlo (no duplica el bucket ni las políticas).
import { config as loadEnv } from "dotenv";

loadEnv();
loadEnv({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { createAdminClient } from "../lib/supabase/admin";

const BUCKET = "avatars";

async function main() {
  const admin = createAdminClient();

  const { data: existing } = await admin.storage.getBucket(BUCKET);
  if (!existing) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    });
    if (error) throw error;
    console.log(`Bucket "${BUCKET}" creado.`);
  } else {
    console.log(`Bucket "${BUCKET}" ya existía, no se tocó.`);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // Cada usuario sube su foto a "<su-authId>/avatar.<ext>". Estas políticas
  // permiten que cualquiera LEA (el bucket es público), pero solo el dueño
  // de esa carpeta puede subir/actualizar/borrar dentro de ella.
  const statements = [
    `drop policy if exists "avatars_public_read" on storage.objects;`,
    `create policy "avatars_public_read" on storage.objects for select using (bucket_id = '${BUCKET}');`,
    `drop policy if exists "avatars_owner_insert" on storage.objects;`,
    `create policy "avatars_owner_insert" on storage.objects for insert with check (bucket_id = '${BUCKET}' and (storage.foldername(name))[1] = auth.uid()::text);`,
    `drop policy if exists "avatars_owner_update" on storage.objects;`,
    `create policy "avatars_owner_update" on storage.objects for update using (bucket_id = '${BUCKET}' and (storage.foldername(name))[1] = auth.uid()::text);`,
    `drop policy if exists "avatars_owner_delete" on storage.objects;`,
    `create policy "avatars_owner_delete" on storage.objects for delete using (bucket_id = '${BUCKET}' and (storage.foldername(name))[1] = auth.uid()::text);`,
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
