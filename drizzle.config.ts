import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env");
} catch {
  // Sem .env (ex.: CI): as variáveis vêm do ambiente.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  // Migrações sempre com o papel dono das tabelas (orbi_owner), nunca com orbi_app.
  dbCredentials: { url: process.env.DATABASE_URL_OWNER ?? "" },
  migrations: { schema: "drizzle", table: "__drizzle_migrations" },
  strict: true,
  verbose: true,
});
