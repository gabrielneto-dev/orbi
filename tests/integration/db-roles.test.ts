import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MIGRATIONS_FOLDER, runMigrations } from "@/server/db/migrate.ts";
import { DB_ROLES } from "@/server/db/roles.ts";
import { createTestDatabase, withClient, type TestDatabase } from "./support/test-database.ts";

// SPEC-0001-T005 / REQ-061: papéis do banco e migrações numa base vazia.

/** Total de migrações em drizzle/ (cresce a cada migração nova). */
const journal = JSON.parse(
  readFileSync(path.join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf8"),
) as { entries: unknown[] };
const expectedMigrations = journal.entries.length;

let testDb: TestDatabase;
let database: string;
let ownerUrl: string;
let appUrl: string;

/** Conexão de superusuário dentro da base temporária, para inspecionar o catálogo. */
let catalog: pg.Client;

function queryAs<T extends pg.QueryResultRow>(url: string, text: string) {
  return withClient(url, (client) => client.query<T>(text));
}

beforeAll(async () => {
  testDb = await createTestDatabase();
  ({ database, ownerUrl, appUrl } = testDb);
  catalog = new pg.Client({ connectionString: testDb.catalogUrl });
  await catalog.connect();
});

afterAll(async () => {
  await catalog?.end();
  await testDb?.drop();
});

describe("papéis PostgreSQL", () => {
  it("nenhum papel do orbi é superusuário nem tem BYPASSRLS", async () => {
    const { rows } = await catalog.query(
      `SELECT rolname, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolcanlogin
         FROM pg_roles WHERE rolname = ANY($1) ORDER BY rolname`,
      [Object.values(DB_ROLES)],
    );
    expect(rows.map((row) => row.rolname)).toEqual(["orbi_app", "orbi_owner", "orbi_platform"]);
    for (const row of rows) {
      expect(row).toMatchObject({
        rolsuper: false,
        rolbypassrls: false,
        rolcreaterole: false,
        rolcreatedb: false,
        rolcanlogin: true,
      });
    }
  });

  it("orbi_app e orbi_platform não são donos de nenhum objeto da base", async () => {
    const { rows } = await catalog.query(
      `SELECT kind, name FROM (
         SELECT 'relação' AS kind, relname::text AS name, relowner AS owner FROM pg_class
         UNION ALL SELECT 'schema', nspname::text, nspowner FROM pg_namespace
         UNION ALL SELECT 'função', proname::text, proowner FROM pg_proc
         UNION ALL SELECT 'tipo', typname::text, typowner FROM pg_type
       ) objects
       WHERE pg_get_userbyid(owner) IN ($1, $2)`,
      [DB_ROLES.app, DB_ROLES.platform],
    );
    expect(rows).toEqual([]);
  });

  it("orbi_app não tem a base nem herda papéis com privilégios", async () => {
    const { rows } = await catalog.query(
      `SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname = $1`,
      [database],
    );
    expect(rows[0]?.owner).toBe(DB_ROLES.owner);

    const memberships = await catalog.query(
      `SELECT r.rolname FROM pg_auth_members m
         JOIN pg_roles r ON r.oid = m.roleid
         JOIN pg_roles u ON u.oid = m.member
        WHERE u.rolname = $1`,
      [DB_ROLES.app],
    );
    expect(memberships.rows).toEqual([]);
  });

  it("orbi_app conecta, mas não cria objetos no schema public", async () => {
    const who = await queryAs<{ current_user: string }>(appUrl, "SELECT current_user");
    expect(who.rows[0]?.current_user).toBe(DB_ROLES.app);

    await expect(queryAs(appUrl, "CREATE TABLE public.intrusa (id int)")).rejects.toMatchObject({
      code: "42501", // insufficient_privilege
    });
  });
});

describe("migrações", () => {
  it("todas aplicam numa base vazia e ficam registradas", async () => {
    const { rows } = await catalog.query<{ total: string }>(
      "SELECT count(*) AS total FROM drizzle.__drizzle_migrations",
    );
    expect(Number(rows[0]?.total)).toBe(expectedMigrations);
  });

  it("é idempotente: rodar de novo não reaplica nada", async () => {
    await runMigrations(ownerUrl);
    const { rows } = await catalog.query<{ total: string }>(
      "SELECT count(*) AS total FROM drizzle.__drizzle_migrations",
    );
    expect(Number(rows[0]?.total)).toBe(expectedMigrations);
  });

  it("recusa rodar com outro papel que não orbi_owner", async () => {
    await expect(runMigrations(appUrl)).rejects.toThrow(/orbi_owner/);
  });

  it("uuid_generate_v7() gera UUID versão 7 com o instante atual e ordenável", async () => {
    const before = Date.now();
    const first = await queryAs<{ id: string }>(appUrl, "SELECT public.uuid_generate_v7() AS id");
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await queryAs<{ id: string }>(appUrl, "SELECT public.uuid_generate_v7() AS id");
    const after = Date.now();

    const firstId = first.rows[0]?.id ?? "";
    const secondId = second.rows[0]?.id ?? "";
    for (const id of [firstId, secondId]) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      const millis = parseInt(id.replaceAll("-", "").slice(0, 12), 16);
      // Folga de 1 min: o relógio da VM do Docker pode diferir um pouco do Windows.
      expect(millis).toBeGreaterThanOrEqual(before - 60_000);
      expect(millis).toBeLessThanOrEqual(after + 60_000);
    }
    expect(firstId < secondId).toBe(true);
  });
});
