
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from the monorepo root
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the .env file');
}

const main = async () => {
  const client = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
  try {
    console.log('🟠 Connecting to the database to inspect the public schema...');
    
    // Query to list all table names in the 'public' schema
    const tables = await client`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    
    console.log('✅ Tables found in public schema:');
    console.log(tables.map(t => t.tablename)); // Log just the names for clarity
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inspecting database:', error);
    await client.end();
    process.exit(1);
  }
};

main();
