
import { execSync } from 'child_process';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

// Cargar el .env de la raíz
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Validar que la variable de entorno exista
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

// El código TypeScript que queremos ejecutar. Usamos onConflictDoNothing() para seguridad.
const tsCode = `
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { plans } from "../lib/db/src/schema/plans.js";

const testPlans = [
  { title: "Fútbol 5 Mixto", category: "Deportes", description: "Partido amistoso en la ciudad.", location: "Canchas del Parque", date: "2024-06-01", time: "18:00", totalCupos: 10, availableCupos: 10, image: "https://picsum.photos/seed/soccer/400/300" },
  { title: "Cata de Café", category: "Gastronomía", description: "Aprende sobre granos especiales.", location: "Café Central", date: "2024-06-02", time: "10:00", totalCupos: 8, availableCupos: 8, image: "https://picsum.photos/seed/coffee/400/300" },
  { title: "Yoga al Aire Libre", category: "Bienestar", description: "Clase relajante al amanecer.", location: "Jardín Botánico", date: "2024-06-03", time: "07:00", totalCupos: 15, availableCupos: 15, image: "https://picsum.photos/seed/yoga/400/300" }
];

async function run() {
  try {
    console.log("🟠 Conectando a la base de datos de Neon...");
    const client = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
    const db = drizzle(client);
    console.log("🟢 Conexión exitosa.");

    console.log("🟠 Insertando datos de prueba...");
    await db.insert(plans).values(testPlans).onConflictDoNothing();
    console.log("✅ ¡Datos insertados con éxito!");
    
    await client.end();
    console.log("🔵 Conexión cerrada.");

  } catch (error) {
    console.error("❌ Error durante el proceso de seed:", error);
    process.exit(1);
  }
}

run();
`;

try {
  console.log("▶️ Ejecutando script de seed a través de pnpm y tsx...");
  // Usamos pnpm para ejecutar tsx, lo que asegura que las dependencias del workspace se resuelvan correctamente.
  execSync(`pnpm tsx -- -e '${tsCode.replace(/'/g, "'\''")}'`, {
    stdio: 'inherit',
    env: process.env
  });
  console.log("🎉 Proceso de seed completado.");
} catch (error) {
  console.error("🔥 Falló la ejecución del script de seed con pnpm. Error:", error);
  process.exit(1);
}
