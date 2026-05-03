
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { plansTable } from '@workspace/db/schema';

// Cargar .env desde la raíz del proyecto de forma robusta
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const testPlans = [
  { title: "Fútbol 5 Mixto", category: "Deportes", description: "Partido amistoso en la ciudad.", location: "Canchas del Parque", date: "2024-06-01", time: "18:00", totalCupos: 10, availableCupos: 10, image: "https://picsum.photos/seed/soccer/400/300" },
  { title: "Cata de Café", category: "Gastronomía", description: "Aprende sobre granos especiales.", location: "Café Central", date: "2024-06-02", time: "10:00", totalCupos: 8, availableCupos: 8, image: "https://picsum.photos/seed/coffee/400/300" },
  { title: "Yoga al Aire Libre", category: "Bienestar", description: "Clase relajante al amanecer.", location: "Jardín Botánico", date: "2024-06-03", time: "07:00", totalCupos: 15, availableCupos: 15, image: "https://picsum.photos/seed/yoga/400/300" }
];

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está definida en el archivo .env');
    process.exit(1);
  }

  try {
    console.log("🟠 Conectando a la base de datos de Neon...");
    const client = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
    const db = drizzle(client);
    console.log("🟢 Conexión exitosa.");

    console.log("🟠 Insertando datos de prueba...");
    await db.insert(plansTable).values(testPlans).onConflictDoNothing();
    console.log("✅ ¡Datos insertados con éxito!");
    
    await client.end();
    console.log("🔵 Conexión cerrada.");

  } catch (error) {
    console.error("❌ Error durante el proceso de seed:", error);
    process.exit(1);
  }
}

run();
