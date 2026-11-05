import { eq, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabase, type Database } from "@/server/db/client.ts";
import { tenants } from "@/server/db/schema/index.ts";
import { InvalidTenantIdError, withTenant } from "@/server/db/tenant.ts";
import { findRlsViolations } from "./support/rls-scan.ts";
import { createTestDatabase, withClient, type TestDatabase } from "./support/test-database.ts";

// SPEC-0001-T006 / REQ-061, REQ-064: tabela tenants, withTenant(), política RLS padrão e varredura.

/** Tabela de exemplo, criada só na base temporária com a política padrão (enable_tenant_rls). */
const examples = pgTable("rls_example", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  label: text("label").notNull(),
});

let testDb: TestDatabase;
let app: { db: Database; pool: pg.Pool };
let tenantA: string;
let tenantB: string;

const labels = (rows: { label: string }[]) => rows.map((row) => row.label).sort();

beforeAll(async () => {
  testDb = await createTestDatabase();

  await withClient(testDb.ownerUrl, async (owner) => {
    await owner.query(`
      CREATE TABLE public.rls_example (
        id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
        tenant_id uuid NOT NULL REFERENCES public.tenants (id),
        label text NOT NULL
      )`);
    await owner.query("CALL public.enable_tenant_rls('public.rls_example')");
    await owner.query("GRANT SELECT, INSERT, UPDATE, DELETE ON public.rls_example TO orbi_app");
  });

  // Empresas criadas pelo papel da plataforma, como fará o admin_plataforma (REQ-062).
  await withClient(testDb.platformUrl, async (platform) => {
    const { rows } = await platform.query<{ id: string; name: string }>(
      `INSERT INTO public.tenants (name, cnpj) VALUES ('Empresa A', '11222333000181'),
              ('Empresa B', '11444777000161') RETURNING id, name`,
    );
    tenantA = rows.find((row) => row.name === "Empresa A")?.id ?? "";
    tenantB = rows.find((row) => row.name === "Empresa B")?.id ?? "";
  });

  // Pool de uma conexão só: prova que app.tenant_id não "vaza" de uma transação para a seguinte.
  app = createDatabase(testDb.appUrl, { max: 1 });
  await withTenant(
    tenantA,
    (tx) =>
      tx.insert(examples).values([
        { tenantId: tenantA, label: "a1" },
        { tenantId: tenantA, label: "a2" },
      ]),
    { db: app.db },
  );
  await withTenant(
    tenantB,
    (tx) => tx.insert(examples).values({ tenantId: tenantB, label: "b1" }),
    {
      db: app.db,
    },
  );
});

afterAll(async () => {
  await app?.pool.end();
  await testDb?.drop();
});

describe("varredura de RLS", () => {
  it("toda tabela com tenant_id tem RLS habilitado, forçado e a política padrão", async () => {
    const violations = await withClient(testDb.catalogUrl, findRlsViolations);
    expect(violations).toEqual([]);
  });

  it("a tabela tenants tem RLS habilitado e forçado", async () => {
    const { rows } = await withClient(testDb.catalogUrl, (client) =>
      client.query(
        `SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid = 'public.tenants'::regclass`,
      ),
    );
    expect(rows[0]).toEqual({ relrowsecurity: true, relforcerowsecurity: true });
  });

  it("detecta tabela sem RLS, sem FORCE, com política extra e views inseguras", async () => {
    // Tudo numa transação desfeita no fim: a base volta ao estado migrado.
    const violations = await withClient(testDb.ownerUrl, async (owner) => {
      await owner.query("BEGIN");
      try {
        await owner.query("CREATE TABLE public.sem_rls (tenant_id uuid)");
        await owner.query("CREATE TABLE public.sem_force (tenant_id uuid)");
        await owner.query("ALTER TABLE public.sem_force ENABLE ROW LEVEL SECURITY");
        await owner.query("CREATE TABLE public.com_brecha (tenant_id uuid)");
        await owner.query("CALL public.enable_tenant_rls('public.com_brecha')");
        await owner.query("CREATE POLICY brecha ON public.com_brecha TO orbi_app USING (true)");
        await owner.query("CREATE VIEW public.view_insegura AS SELECT * FROM public.rls_example");
        await owner.query(
          "CREATE VIEW public.view_segura WITH (security_invoker = true) AS SELECT * FROM public.rls_example",
        );
        await owner.query(
          "CREATE MATERIALIZED VIEW public.view_materializada AS SELECT * FROM public.rls_example",
        );
        return await findRlsViolations(owner);
      } finally {
        await owner.query("ROLLBACK");
      }
    });
    expect(violations).toEqual([
      'public.com_brecha: política permissiva extra "brecha" vale para a aplicação',
      "public.sem_force: RLS não forçado (FORCE)",
      "public.sem_force: sem a política padrão tenant_isolation (enable_tenant_rls)",
      "public.sem_rls: RLS não habilitado",
      "public.sem_rls: RLS não forçado (FORCE)",
      "public.sem_rls: sem a política padrão tenant_isolation (enable_tenant_rls)",
      "public.view_insegura: view com tenant_id sem security_invoker",
      "public.view_materializada: view materializada com tenant_id (não suporta RLS)",
    ]);
    expect(await withClient(testDb.catalogUrl, findRlsViolations)).toEqual([]);
  });
});

describe("withTenant() e a política padrão", () => {
  it("cada empresa só vê os próprios registros", async () => {
    const seenByA = await withTenant(tenantA, (tx) => tx.select().from(examples), { db: app.db });
    const seenByB = await withTenant(tenantB, (tx) => tx.select().from(examples), { db: app.db });
    expect(labels(seenByA)).toEqual(["a1", "a2"]);
    expect(labels(seenByB)).toEqual(["b1"]);
    expect(seenByA.every((row) => row.tenantId === tenantA)).toBe(true);
  });

  it("sem empresa definida, zero linhas (também na conexão reaproveitada pelo pool)", async () => {
    // A conexão única do pool acabou de executar transações com app.tenant_id definido.
    expect(await app.db.select().from(examples)).toEqual([]);
    const setting = await app.db.execute<{ tenant: string | null }>(
      sql`SELECT public.current_tenant_id() AS tenant`,
    );
    expect(setting.rows[0]?.tenant).toBeNull();
  });

  it("o FORCE vale até para o dono da tabela", async () => {
    const { rows } = await withClient(testDb.ownerUrl, (owner) =>
      owner.query("SELECT * FROM public.rls_example"),
    );
    expect(rows).toEqual([]);
  });

  it("não lê, altera nem apaga registro de outra empresa, mesmo pelo ID", async () => {
    const [b1] = await withTenant(tenantB, (tx) => tx.select().from(examples), { db: app.db });
    const idOfB = b1?.id ?? "";

    const result = await withTenant(
      tenantA,
      async (tx) => ({
        read: await tx.select().from(examples).where(eq(examples.id, idOfB)),
        updated: await tx
          .update(examples)
          .set({ label: "invadido" })
          .where(eq(examples.id, idOfB))
          .returning(),
        deleted: await tx.delete(examples).where(eq(examples.id, idOfB)).returning(),
      }),
      { db: app.db },
    );
    expect(result).toEqual({ read: [], updated: [], deleted: [] });

    const stillThere = await withTenant(tenantB, (tx) => tx.select().from(examples), {
      db: app.db,
    });
    expect(labels(stillThere)).toEqual(["b1"]);
  });

  it("não grava nem move registro para outra empresa (WITH CHECK)", async () => {
    await expect(
      withTenant(tenantA, (tx) => tx.insert(examples).values({ tenantId: tenantB, label: "x" }), {
        db: app.db,
      }),
    ).rejects.toMatchObject({ cause: { code: "42501" } });

    await expect(
      withTenant(tenantA, (tx) => tx.update(examples).set({ tenantId: tenantB }), { db: app.db }),
    ).rejects.toMatchObject({ cause: { code: "42501" } });
  });

  it("erro dentro de withTenant() desfaz a transação inteira", async () => {
    await expect(
      withTenant(
        tenantA,
        async (tx) => {
          await tx.insert(examples).values({ tenantId: tenantA, label: "desfeito" });
          throw new Error("falha proposital");
        },
        { db: app.db },
      ),
    ).rejects.toThrow("falha proposital");

    const rows = await withTenant(tenantA, (tx) => tx.select().from(examples), { db: app.db });
    expect(labels(rows)).toEqual(["a1", "a2"]);
  });

  it("recusa tenantId que não é UUID, sem tocar no banco", async () => {
    for (const invalid of ["", "abc", `${tenantA}' OR true --`]) {
      await expect(withTenant(invalid, async () => "nunca", { db: app.db })).rejects.toBeInstanceOf(
        InvalidTenantIdError,
      );
    }
  });
});

describe("tabela tenants", () => {
  it("a aplicação só enxerga a própria empresa", async () => {
    const seenByA = await withTenant(tenantA, (tx) => tx.select().from(tenants), { db: app.db });
    expect(seenByA.map((tenant) => tenant.id)).toEqual([tenantA]);
    expect(seenByA[0]).toMatchObject({ name: "Empresa A", status: "active" });
    expect(await app.db.select().from(tenants)).toEqual([]);
  });

  it("a aplicação não cria nem altera empresas", async () => {
    await expect(
      withTenant(tenantA, (tx) => tx.insert(tenants).values({ name: "Intrusa", cnpj: "x" }), {
        db: app.db,
      }),
    ).rejects.toMatchObject({ cause: { code: "42501" } });
    await expect(
      withTenant(tenantA, (tx) => tx.update(tenants).set({ status: "active" }), { db: app.db }),
    ).rejects.toMatchObject({ cause: { code: "42501" } });
  });

  it("a plataforma vê todas as empresas, suspende e reativa, mas não apaga nem lê dados delas", async () => {
    await withClient(testDb.platformUrl, async (platform) => {
      const all = await platform.query("SELECT id FROM public.tenants");
      expect(all.rows.map((row) => row.id).sort()).toEqual([tenantA, tenantB].sort());

      const suspended = await platform.query(
        "UPDATE public.tenants SET status = 'suspended' WHERE id = $1 RETURNING status",
        [tenantB],
      );
      expect(suspended.rows).toEqual([{ status: "suspended" }]);
      await platform.query("UPDATE public.tenants SET status = 'active' WHERE id = $1", [tenantB]);

      await expect(
        platform.query("DELETE FROM public.tenants WHERE id = $1", [tenantB]),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(platform.query("SELECT * FROM public.rls_example")).rejects.toMatchObject({
        code: "42501",
      });
    });
  });

  it("status aceita só active e suspended", async () => {
    await withClient(testDb.platformUrl, async (platform) => {
      await expect(
        platform.query("UPDATE public.tenants SET status = 'deleted' WHERE id = $1", [tenantA]),
      ).rejects.toMatchObject({ code: "23514" }); // check_violation
    });
  });
});
