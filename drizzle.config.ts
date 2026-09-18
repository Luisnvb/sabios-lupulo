import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  // Para "generate" no hace falta una conexión real, pero drizzle-kit
  // exige que la variable exista en el entorno de configuración.
  process.env.DATABASE_URL = "postgres://placeholder-for-generate-only";
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
