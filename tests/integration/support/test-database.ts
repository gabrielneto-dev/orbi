import { randomBytes } from "node:crypto";
import pg from "pg";
import { bootstrapDatabase } from "@/server/db/bootstrap.ts";
import { runMigrations } from "@/server/db/migrate.ts";
import { withDatabase } from "@/server/db/roles.ts";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} (veja .env.example) para os testes de integração`);
  return value;
}

export type TestDatabase = {
  database: string;
  adminUrl: string;
  ownerUrl: string;
  appUrl: string;
  platformUrl: string;
  /** Superusuário dentro da base temporária, para inspecionar o catálogo. */
  catalogUrl: string;
  drop: () => Promise<void>;
};

/**
 * Cria uma base vazia e temporária (`orbi_test_<hex>`), roda o bootstrap dos papéis e todas as
 * migrações. Chame `drop()` no `afterAll`.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const database = `orbi_test_${randomBytes(4).toString("hex")}`;
  const adminUrl = requireEnv("DATABASE_URL_ADMIN");
  const ownerUrl = withDatabase(requireEnv("DATABASE_URL_OWNER"), database);
  const appUrl = withDatabase(requireEnv("DATABASE_URL"), database);
  const platformUrl = withDatabase(requireEnv("DATABASE_URL_PLATFORM"), database);

  await bootstrapDatabase({ adminUrl, ownerUrl, appUrl, platformUrl });
  await runMigrations(ownerUrl);

  return {
    database,
    adminUrl,
    ownerUrl,
    appUrl,
    platformUrl,
    catalogUrl: withDatabase(adminUrl, database),
    drop: async () => {
      const admin = new pg.Client({ connectionString: adminUrl });
      await admin.connect();
      try {
        await admin.query(
          `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(database)} WITH (FORCE)`,
        );
      } finally {
        await admin.end();
      }
    },
  };
}

/** Abre uma conexão, roda `fn` e fecha. */
export async function withClient<T>(url: string, fn: (client: pg.Client) => Promise<T>) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
