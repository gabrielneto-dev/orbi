import { randomBytes } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootstrapDatabase } from "@/server/db/bootstrap.ts";
import { runMigrations } from "@/server/db/migrate.ts";
import { DB_ROLES, withDatabase } from "@/server/db/roles.ts";

// SPEC-0001-T005 / REQ-061: papéis do banco e migração inicial numa base vazia.

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} (veja .env.example) para os testes de integração`);
  return value;
}

const database = `orbi_test_${randomBytes(4).toString("hex")}`;
const adminUrl = env("DATABASE_URL_ADMIN");
const ownerUrl = withDatabase(env("DATABASE_URL_OWNER"), database);
const appUrl = withDatabase(env("DATABASE_URL"), database);
const platformUrl = withDatabase(env("DATABASE_URL_PLATFORM"), database);

/** Conexão de superusuário dentro da base temporária, para inspecionar o catálogo. */
let catalog: pg.Client;

async function queryAs<T extends pg.QueryResultRow>(url: string, text: string) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await client.query<T>(text);
  } finally {
    await client.end();
  }
}

beforeAll(async () => {
  await bootstrapDatabase({ adminUrl, ownerUrl, appUrl, platformUrl });
  await runMigrations(ownerUrl);
  catalog = new pg.Client({ connectionString: withDatabase(adminUrl, database) });
  await catalog.connect();
});

afterAll(async () => {
  await catalog?.end();
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${admin.escapeIdentifier(database)} WITH (FORCE)`);
  } finally {
    await admin.end();
  }
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

describe("migração inicial", () => {
  it("aplica numa base vazia e fica registrada", async () => {
    const { rows } = await catalog.query<{ total: string }>(
      "SELECT count(*) AS total FROM drizzle.__drizzle_migrations",
    );
    expect(Number(rows[0]?.total)).toBe(1);
  });

  it("é idempotente: rodar de novo não reaplica nada", async () => {
    await runMigrations(ownerUrl);
    const { rows } = await catalog.query<{ total: string }>(
      "SELECT count(*) AS total FROM drizzle.__drizzle_migrations",
    );
    expect(Number(rows[0]?.total)).toBe(1);
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
