import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.ts";

export type Database = NodePgDatabase<typeof schema>;

/** Cria um cliente Drizzle com pool próprio. Use `getDb()` na aplicação; isto é para testes e scripts. */
export function createDatabase(connectionString: string, poolConfig: pg.PoolConfig = {}) {
  const pool = new pg.Pool({ ...poolConfig, connectionString });
  return { db: drizzle(pool, { schema }), pool };
}

// Guardado em globalThis para o hot reload do `next dev` não abrir um pool novo a cada edição.
const globalForDb = globalThis as typeof globalThis & { __orbiDb?: Database };

/**
 * Cliente da aplicação: conecta como `orbi_app` (DATABASE_URL), sujeito a RLS.
 * Consultas a dados de empresa passam sempre por `withTenant()`.
 */
export function getDb(): Database {
  if (!globalForDb.__orbiDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Variável DATABASE_URL não definida (veja .env.example)");
    globalForDb.__orbiDb = createDatabase(url).db;
  }
  return globalForDb.__orbiDb;
}
