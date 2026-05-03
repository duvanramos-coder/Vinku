import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { plansTable } from './schema/plans.js';

// Carga el .env desde la raíz del monorepo
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el archivo .env');
}

const main = async () => {
  const client = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  const db = drizzle(client);

  try {
    console.log('🟠 Empezando el proceso de seed para la base de datos de Neon...');

    const testPlans = [
      {
        title: 'Partido de Fútbol 5',
        category: 'Deporte',
        description: 'Partido amistoso de fútbol 5. ¡Todos los niveles son bienvenidos!',
        location: 'Canchas Campín 5, Bogotá',
        date: '2024-09-10',
        time: '20:00:00',
        totalCupos: 10,
        availableCupos: 10,
        image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0',
      },
      {
        title: 'Clase de Yoga al Parque',
        category: 'Bienestar',
        description: 'Sesión de Vinyasa yoga para empezar el día con energía. Trae tu propio mat.',
        location: 'Parque El Virrey, Bogotá',
        date: '2024-09-12',
        time: '08:00:00',
        totalCupos: 25,
        availableCupos: 25,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
      },
      {
        title: 'Club de Cata de Café',
        category: 'Social',
        description: 'Explora los diferentes perfiles de sabor del café de origen colombiano.',
        location: 'Café Devoción, Bogotá',
        date: '2024-09-14',
        time: '16:00:00',
        totalCupos: 15,
        availableCupos: 15,
        image: 'https://images.unsplash.com/photo-1511920183303-92c134d64a93',
      },
    ];

    console.log('🟠 Insertando planes de prueba...');
    await db.insert(plansTable).values(testPlans).onConflictDoNothing();

    console.log('✅ ¡Base de datos poblada con éxito!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    await client.end();
    process.exit(1);
  }
};

main();
