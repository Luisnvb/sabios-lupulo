import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

/**
 * Punto único de conexión a Postgres (Neon), igual que en trivia-friends:
 * driver neon-serverless (Pool sobre WebSocket) en vez de neon-http, porque
 * el DAL usa transacciones (createQuestion) y neon-http no las soporta.
 */

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL no está definida. Configura la variable de entorno " +
      "(ver .env.local.example) antes de arrancar la aplicación."
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
