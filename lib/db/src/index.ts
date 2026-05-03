
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/pg-proxy";
import * as schema from "./schema/index.js";

config({ path: ".env" });

// The remote callback function that drizzle expects.
// It should return a promise that resolves to an object with a `rows` property.
const remoteCallback = async (sql: string, params: any[], method: "all" | "execute") => {
  try {
    const res = await fetch("http://127.0.0.1:54321/api/pg", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sql,
        params,
        method,
        connectionString: process.env.DB_URL,
      }),
    });

    // We are explicitly casting the result to the type that drizzle expects.
    // This is safe because we know the shape of the API response.
    const result = await res.json() as { rows: any[] };
    return result;

  } catch (e: any) {
    console.error("Error in remote callback:", e.message);
    // Ensure we always return an object with a rows property, even in case of an error.
    return { rows: [] }; 
  }
};

const db = drizzle(remoteCallback, { schema });

export { db };
export * from "./schema/index.js";
