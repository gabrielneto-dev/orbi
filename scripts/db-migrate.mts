// pnpm db:migrate — aplica as migrações de drizzle/ como orbi_owner. Requer DATABASE_URL_OWNER.
import { runMigrations } from "../src/server/db/migrate.ts";

const ownerUrl = process.env.DATABASE_URL_OWNER;

if (!ownerUrl) {
  console.error("Variável DATABASE_URL_OWNER não definida (veja .env.example)");
  process.exitCode = 1;
} else {
  try {
    await runMigrations(ownerUrl);
    console.log("Migrações aplicadas.");
  } catch (error) {
    console.error(`Migração falhou: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
