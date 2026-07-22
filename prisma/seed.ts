import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Property, type Reservation } from "../lib/generated/prisma/client";
import { createAdminClient } from "../lib/supabase/admin";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const supabaseAdmin = createAdminClient();

const DEV_PASSWORD = "Password123!";

// Crea (o reutiliza, si ya existe por una corrida anterior del seed) el
// usuario en Supabase Auth y devuelve su id (auth.users.id / uuid). Ese id es
// el que guardamos como `authId` en nuestra tabla User.
async function upsertAuthUser(email: string, password: string, meta: { name: string; role: string }) {
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: meta.name },
    app_metadata: { role: meta.role },
  });

  if (!created.error) return created.data.user.id;

  if (!/already.*registered/i.test(created.error.message)) {
    throw created.error;
  }

  // Ya existe: lo localizamos por correo y refrescamos su contraseña/metadata
  // para que quede en el mismo estado que definimos aquí.
  let existingId: string | undefined;
  for (let page = 1; page <= 10 && !existingId; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    existingId = data.users.find((u) => u.email === email)?.id;
    if (data.users.length < 200) break;
  }
  if (!existingId) {
    throw new Error(`No se pudo localizar el usuario de Supabase Auth existente para ${email}`);
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingId, {
    password,
    user_metadata: { name: meta.name },
    app_metadata: { role: meta.role },
  });
  if (updateError) throw updateError;

  return existingId;
}

async function createSeedUser(data: {
  name: string;
  email: string;
  role: "client" | "agent" | "broker" | "admin";
  siteId: string;
  accessLevel?: "site" | "global";
  status?: "active" | "inactive" | "away";
  lastLoginAt?: Date;
}) {
  const authId = await upsertAuthUser(data.email, DEV_PASSWORD, { name: data.name, role: data.role });
  return prisma.user.create({
    data: {
      authId,
      name: data.name,
      email: data.email,
      role: data.role,
      siteId: data.siteId,
      accessLevel: data.accessLevel,
      status: data.status ?? "active",
      lastLoginAt: data.lastLoginAt,
    },
  });
}

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.propertyAssignment.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();

  const huasteca = await prisma.site.create({ data: { name: "Huasteca", code: "HUA" } });
  const cdmx = await prisma.site.create({ data: { name: "Ciudad de México", code: "CDMX" } });

  const superAdmin = await createSeedUser({
    name: "Laura Sánchez",
    email: "admin@cowork.mx",
    role: "admin",
    accessLevel: "global",
    siteId: huasteca.id,
    status: "active",
    lastLoginAt: new Date(),
  });

  const siteAdmin = await createSeedUser({
    name: "Marco Torres",
    email: "admin.huasteca@cowork.mx",
    role: "admin",
    accessLevel: "site",
    siteId: huasteca.id,
    status: "active",
    lastLoginAt: daysAgo(1),
  });

  const agentsData = [
    { name: "Ana Ruiz", email: "ana.ruiz@cowork.mx", role: "agent" as const, siteId: huasteca.id },
    { name: "Diego Fernández", email: "diego.fernandez@cowork.mx", role: "broker" as const, siteId: huasteca.id },
    { name: "Sofía Morales", email: "sofia.morales@cowork.mx", role: "agent" as const, siteId: cdmx.id },
    { name: "Rodrigo Peña", email: "rodrigo.pena@cowork.mx", role: "broker" as const, siteId: cdmx.id },
  ];

  const agents = [];
  for (const a of agentsData) {
    agents.push(await createSeedUser({ ...a, status: "active", lastLoginAt: daysAgo(2) }));
  }

  const clientNames = [
    "Valeria Gómez", "Luis Hernández", "Camila Reyes", "Andrés Castillo", "Fernanda López",
    "Javier Ortiz", "Mariana Cruz", "Ricardo Vargas", "Paola Jiménez", "Emilio Navarro",
    "Daniela Ramírez", "Héctor Guzmán", "Ximena Aguilar", "Sebastián Rojas", "Renata Domínguez",
  ];

  const statuses: Array<"active" | "inactive" | "away"> = ["active", "active", "active", "inactive", "away"];

  const clients = [];
  for (let i = 0; i < clientNames.length; i++) {
    const name = clientNames[i];
    const email = `${slug(name)}@example.com`;
    const status = statuses[i % statuses.length];
    clients.push(
      await createSeedUser({
        name,
        email,
        role: "client",
        siteId: i % 2 === 0 ? huasteca.id : cdmx.id,
        status,
        lastLoginAt: status === "inactive" ? daysAgo(120) : daysAgo(i + 1),
      })
    );
  }

  const propertiesData = [
    { name: "Oficina Sierra 1", type: "office" as const, siteId: huasteca.id, capacity: 4, hourlyRate: 150, dailyRate: 900, monthlyRate: 12000 },
    { name: "Oficina Sierra 2", type: "office" as const, siteId: huasteca.id, capacity: 6, hourlyRate: 200, dailyRate: 1200, monthlyRate: 16000 },
    { name: "Sala Cascada", type: "meeting_room" as const, siteId: huasteca.id, capacity: 10, hourlyRate: 250, dailyRate: 1500, monthlyRate: 0 },
    { name: "Sala Huapango", type: "meeting_room" as const, siteId: huasteca.id, capacity: 8, hourlyRate: 220, dailyRate: 1300, monthlyRate: 0 },
    { name: "Oficina Valles Norte", type: "office" as const, siteId: huasteca.id, capacity: 3, hourlyRate: 120, dailyRate: 700, monthlyRate: 9500 },
    { name: "Oficina Reforma 1", type: "office" as const, siteId: cdmx.id, capacity: 5, hourlyRate: 300, dailyRate: 1800, monthlyRate: 24000 },
    { name: "Oficina Reforma 2", type: "office" as const, siteId: cdmx.id, capacity: 8, hourlyRate: 380, dailyRate: 2200, monthlyRate: 30000 },
    { name: "Sala Polanco", type: "meeting_room" as const, siteId: cdmx.id, capacity: 12, hourlyRate: 350, dailyRate: 2000, monthlyRate: 0 },
    { name: "Sala Roma", type: "meeting_room" as const, siteId: cdmx.id, capacity: 6, hourlyRate: 260, dailyRate: 1500, monthlyRate: 0 },
    { name: "Oficina Condesa", type: "office" as const, siteId: cdmx.id, capacity: 4, hourlyRate: 280, dailyRate: 1600, monthlyRate: 21000 },
  ];

  const properties: Property[] = [];
  for (const p of propertiesData) {
    properties.push(await prisma.property.create({ data: p }));
  }

  const huastecaProps = properties.filter((p) => p.siteId === huasteca.id);
  const cdmxProps = properties.filter((p) => p.siteId === cdmx.id);

  await assign(agents[0].id, huastecaProps.slice(0, 3)); // Ana Ruiz
  await assign(agents[1].id, huastecaProps.slice(3, 5)); // Diego Fernández
  await assign(agents[2].id, cdmxProps.slice(0, 3)); // Sofía Morales
  await assign(agents[3].id, cdmxProps.slice(3, 5)); // Rodrigo Peña

  async function assign(agentId: string, props: typeof properties) {
    for (const p of props) {
      await prisma.propertyAssignment.create({ data: { agentId, propertyId: p.id } });
    }
  }

  const rateTypes: Array<"hourly" | "daily" | "monthly"> = ["hourly", "daily", "monthly"];
  let resIdx = 0;
  const reservationsByClientId = new Map<string, Reservation[]>();
  for (const client of clients) {
    const siteProps = client.siteId === huasteca.id ? huastecaProps : cdmxProps;
    const numReservations = 1 + (resIdx % 3);
    const clientReservations: Reservation[] = [];
    for (let j = 0; j < numReservations; j++) {
      const property = siteProps[(resIdx + j) % siteProps.length];
      const rateType = rateTypes[(resIdx + j) % rateTypes.length];
      const offsetDays = (resIdx % 5) - 2 + j * 7; // spread across past/present/future
      const start = daysFromNow(offsetDays);
      const end = new Date(start.getTime() + durationFor(rateType));
      const status: "completed" | "confirmed" | "pending" =
        offsetDays < -1 ? "completed" : offsetDays <= 1 ? "confirmed" : "pending";

      const reservation = await prisma.reservation.create({
        data: {
          propertyId: property.id,
          userId: client.id,
          rateType,
          startAt: start,
          endAt: end,
          status,
          totalPrice: priceFor(property, rateType),
        },
      });
      clientReservations.push(reservation);
    }
    reservationsByClientId.set(client.id, clientReservations);
    resIdx++;
  }

  const exampleClient = clients.find((c) => c.name === "Sebastián Rojas")!;
  const exampleReservation = reservationsByClientId
    .get(exampleClient.id)!
    .find((r) => r.status === "confirmed")!;

  await prisma.issueReport.create({
    data: {
      reservationId: exampleReservation.id,
      userId: exampleClient.id,
      category: "maintenance",
      description: "El proyector de la sala no enciende y tenemos una presentación con un cliente en una hora.",
      status: "open",
    },
  });

  console.log("\nSeed completado (perfiles + usuarios de Supabase Auth).");
  console.log(`Sedes: Huasteca (${huasteca.id}), CDMX (${cdmx.id})`);
  console.log(`Usuarios creados: ${2 + agents.length + clients.length}`);
  console.log(`Contraseña de todos los usuarios: ${DEV_PASSWORD}`);
  console.log(`Admin global (usuario genérico de prueba): ${superAdmin.email}`);
  console.log(`Admin de sede: ${siteAdmin.email}`);
  console.log(`Agentes/brokers: ${agents.map((a) => a.email).join(", ")}`);
  console.log(`Incidencia de ejemplo: ${exampleClient.email} reportó un problema de mantenimiento`);
}

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/\s+/g, ".");
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

function durationFor(rateType: "hourly" | "daily" | "monthly") {
  const hour = 60 * 60 * 1000;
  if (rateType === "hourly") return 2 * hour;
  if (rateType === "daily") return 24 * hour;
  return 30 * 24 * hour;
}

function priceFor(property: { hourlyRate: unknown; dailyRate: unknown; monthlyRate: unknown }, rateType: "hourly" | "daily" | "monthly") {
  const rate = rateType === "hourly" ? property.hourlyRate : rateType === "daily" ? property.dailyRate : property.monthlyRate;
  return Number(rate);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
