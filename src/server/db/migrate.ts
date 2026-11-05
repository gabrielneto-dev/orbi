import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { DB_ROLES } from "./roles.ts";

export const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle");

/**
 * Aplica as migrações pendentes. Recusa rodar com outro papel que não orbi_owner: migração feita
 * por superusuário ou pela aplicação deixaria objetos com o dono errado (e fora do modelo de RLS).
 */
export async function runMigrations(ownerUrl: string, migrationsFolder = MIGRATIONS_FOLDER) {
  const pool = new pg.Pool({ connectionString: ownerUrl, max: 1 });
  try {
    const { rows } = await pool.query<{ current_user: string }>("SELECT current_user");
    const currentUser = rows[0]?.current_user;
    if (currentUser !== DB_ROLES.owner) {
      throw new Error(
        `Migrações devem rodar como ${DB_ROLES.owner} (conectado como ${currentUser})`,
      );
    }
    await migrate(drizzle(pool), {
      migrationsFolder,
      migrationsSchema: "drizzle",
      migrationsTable: "__drizzle_migrations",
    });
  } finally {
    await pool.end();
  }
}
