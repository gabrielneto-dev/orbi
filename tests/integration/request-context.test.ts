import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "@/lib/validation.ts";
import { createAuthModule, type AuthModule } from "@/server/auth";
import { createWrappers } from "@/server/context.ts";
import { createDatabase, type Database } from "@/server/db/client.ts";
import { users } from "@/server/db/schema/index.ts";
import { conflict, notFound } from "@/server/result.ts";
import { createTestDatabase, withClient, type TestDatabase } from "./support/test-database.ts";

// SPEC-0001-T009 / REQ-001, REQ-003, REQ-049, REQ-063: RequestContext e wrappers action()/handler().

const BASE_URL = "https://orbi.test";
const SESSION_COOKIE = "__Secure-better-auth.session_token";
const PASSWORD = "senha-forte-123";

let testDb: TestDatabase;
let authConnection: { db: Database; pool: pg.Pool };
let appConnection: { db: Database; pool: pg.Pool };
let auth: AuthModule;
let wrappers: ReturnType<typeof createWrappers>;
let tenantA: string;
let tenantB: string;
let ipCounter = 0;

/** Cookies da "requisição atual" das Server Actions (no app, vêm de next/headers). */
let currentHeaders = new Headers();

async function newUser(tenantId: string | null, roles: ("gestor" | "admin_plataforma")[]) {
  const email = `u-${randomBytes(4).toString("hex")}@empresa.test`;
  const { id } = await auth.createUserWithPassword({
    name: "Pessoa Teste",
    email,
    password: PASSWORD,
    tenantId,
    roles,
  });
  return { id, email };
}

/** Faz login pelo handler HTTP e devolve o cabeçalho `cookie` da sessão. */
async function login(email: string): Promise<string> {
  const response = await auth.handle(
    new Request(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: BASE_URL,
        "x-forwarded-for": `198.51.100.${++ipCounter}`,
      },
      body: JSON.stringify({ email, password: PASSWORD }),
    }),
  );
  expect(response.status).toBe(200);
  const cookie = response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.split(";")[0] ?? "";
}

async function setTenantStatus(id: string, status: "active" | "suspended") {
  await withClient(testDb.platformUrl, (platform) =>
    platform.query("UPDATE public.tenants SET status = $2 WHERE id = $1", [id, status]),
  );
}

/** Ação de exemplo: valida a entrada e lê os usuários visíveis pela empresa do contexto. */
const echoInput = z.object({ nome: z.string().min(2) });
const echo = () =>
  wrappers.action({ input: echoInput }, async ({ ctx, input }) => {
    const visible = await ctx.withTenant((tx) =>
      tx.select({ tenantId: users.tenantId }).from(users),
    );
    return {
      nome: input.nome,
      tenantId: ctx.tenantId,
      roles: ctx.roles,
      visibleTenants: [...new Set(visible.map((row) => row.tenantId))],
    };
  });

/** Route handler de exemplo, com params e corpo validado. */
const echoHandler = () =>
  wrappers.handler({ body: echoInput }, async ({ ctx, params, body }) => {
    if (params.id === "outra-empresa") throw notFound();
    if (params.id === "versao-antiga") throw conflict();
    if (params.id === "redirect") return Response.redirect(`${BASE_URL}/arquivo`, 302);
    if (params.id === "bug") throw new Error("erro inesperado");
    return { id: params.id, nome: body.nome, tenantId: ctx.tenantId };
  });

function callHandler(id: string, body: unknown, cookie?: string) {
  const headers = new Headers({ "content-type": "application/json" });
  if (cookie) headers.set("cookie", cookie);
  const request = new Request(`${BASE_URL}/api/exemplo/${id}`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return echoHandler()(request, { params: Promise.resolve({ id }) });
}

beforeAll(async () => {
  testDb = await createTestDatabase();
  await withClient(testDb.platformUrl, async (platform) => {
    const { rows } = await platform.query<{ id: string }>(
      `INSERT INTO public.tenants (name, cnpj) VALUES ('Empresa A', '11222333000181'),
              ('Empresa B', '11444777000161') RETURNING id`,
    );
    [tenantA, tenantB] = rows.map((row) => row.id) as [string, string];
  });
  authConnection = createDatabase(testDb.authUrl);
  appConnection = createDatabase(testDb.appUrl);
  auth = createAuthModule({
    db: authConnection.db,
    secret: randomBytes(32).toString("base64url"),
    baseURL: BASE_URL,
  });
  wrappers = createWrappers(() => ({
    getSession: (headers) => auth.getSession(headers ?? currentHeaders),
    db: appConnection.db,
  }));
  // Um usuário em B, para provar que o contexto de A não o enxerga.
  await newUser(tenantB, ["gestor"]);
});

beforeEach(() => {
  currentHeaders = new Headers();
});

afterAll(async () => {
  await authConnection?.pool.end();
  await appConnection?.pool.end();
  await testDb?.drop();
});

describe("action()", () => {
  it("sem sessão → UNAUTHENTICATED, sem executar a ação nem validar a entrada", async () => {
    let ran = false;
    const guarded = wrappers.action({ input: echoInput }, async () => {
      ran = true;
      return "nunca";
    });
    expect(await guarded({ nome: "x" })).toEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Entre para continuar",
    });
    expect(ran).toBe(false);
  });

  it("com sessão válida, executa com o contexto da empresa do usuário (RLS)", async () => {
    const { email } = await newUser(tenantA, ["gestor"]);
    currentHeaders = new Headers({ cookie: await login(email) });
    expect(await echo()({ nome: "Ana" })).toEqual({
      ok: true,
      data: { nome: "Ana", tenantId: tenantA, roles: ["gestor"], visibleTenants: [tenantA] },
    });
  });

  it("entrada inválida → VALIDATION (422) com mensagens por campo em pt-BR", async () => {
    const { email } = await newUser(tenantA, ["gestor"]);
    currentHeaders = new Headers({ cookie: await login(email) });
    const result = await echo()({ nome: "A" });
    expect(result).toMatchObject({ ok: false, code: "VALIDATION" });
    if (result.ok) return;
    expect(Object.keys(result.fields ?? {})).toEqual(["nome"]);
    expect(result.fields?.nome?.[0]).toMatch(/2 caracteres/);
  });

  it("usuário desativado depois do login → FORBIDDEN na próxima ação", async () => {
    const { id, email } = await newUser(tenantA, ["gestor"]);
    currentHeaders = new Headers({ cookie: await login(email) });
    expect((await echo()({ nome: "Ana" })).ok).toBe(true);

    await authConnection.db.update(users).set({ active: false }).where(eq(users.id, id));
    expect(await echo()({ nome: "Ana" })).toEqual({
      ok: false,
      code: "FORBIDDEN",
      message: "Usuário desativado. Fale com o gestor da sua empresa.",
    });
  });

  it("empresa suspensa → FORBIDDEN para quem já estava logado; reativada → volta a funcionar", async () => {
    const { email } = await newUser(tenantA, ["gestor"]);
    currentHeaders = new Headers({ cookie: await login(email) });
    await setTenantStatus(tenantA, "suspended");
    try {
      expect(await echo()({ nome: "Ana" })).toEqual({
        ok: false,
        code: "FORBIDDEN",
        message: "Empresa suspensa. Fale com o suporte do orbi.",
      });
    } finally {
      await setTenantStatus(tenantA, "active");
    }
    expect(await echo()({ nome: "Ana" })).toMatchObject({ ok: true, data: { tenantId: tenantA } });
  });

  it("admin_plataforma não usa ações das empresas → FORBIDDEN", async () => {
    const { email } = await newUser(null, ["admin_plataforma"]);
    currentHeaders = new Headers({ cookie: await login(email) });
    expect(await echo()({ nome: "Ana" })).toMatchObject({ ok: false, code: "FORBIDDEN" });
  });

  it("sessão encerrada (logout) → UNAUTHENTICATED", async () => {
    const { email } = await newUser(tenantA, ["gestor"]);
    const cookie = await login(email);
    await auth.handle(
      new Request(`${BASE_URL}/api/auth/sign-out`, {
        method: "POST",
        headers: { cookie, origin: BASE_URL, "content-type": "application/json" },
        body: "{}",
      }),
    );
    currentHeaders = new Headers({ cookie });
    expect(await echo()({ nome: "Ana" })).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
  });

  it("AppError lançado pela ação vira resultado; erro inesperado sobe", async () => {
    const { email } = await newUser(tenantA, ["gestor"]);
    currentHeaders = new Headers({ cookie: await login(email) });
    const missing = wrappers.action({}, async () => {
      throw notFound();
    });
    expect(await missing()).toEqual({ ok: false, code: "NOT_FOUND", message: "Não encontrado" });

    const buggy = wrappers.action({}, async () => {
      throw new Error("erro inesperado");
    });
    await expect(buggy()).rejects.toThrow("erro inesperado");
  });
});

describe("handler()", () => {
  let cookie: string;

  beforeAll(async () => {
    const { email } = await newUser(tenantA, ["gestor"]);
    cookie = await login(email);
  });

  it("sem sessão → 401 com o resultado padronizado em JSON", async () => {
    const response = await callHandler("1", { nome: "Ana" });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Entre para continuar",
    });
  });

  it("com sessão → 200 { ok: true, data }, com params e corpo validado", async () => {
    const response = await callHandler("1", { nome: "Ana" }, cookie);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      data: { id: "1", nome: "Ana", tenantId: tenantA },
    });
  });

  it("corpo inválido ou JSON malformado → 422", async () => {
    const invalid = await callHandler("1", { nome: "A" }, cookie);
    expect(invalid.status).toBe(422);
    expect(await invalid.json()).toMatchObject({
      code: "VALIDATION",
      fields: { nome: [expect.any(String)] },
    });

    const malformed = await callHandler("1", "{ não é json", cookie);
    expect(malformed.status).toBe(422);
    expect(await malformed.json()).toMatchObject({
      code: "VALIDATION",
      fields: { "": [expect.any(String)] },
    });
  });

  it("NOT_FOUND → 404 e CONFLICT → 409", async () => {
    const missing = await callHandler("outra-empresa", { nome: "Ana" }, cookie);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({ ok: false, code: "NOT_FOUND" });
    const stale = await callHandler("versao-antiga", { nome: "Ana" }, cookie);
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ ok: false, code: "CONFLICT" });
  });

  it("empresa suspensa → 403", async () => {
    await setTenantStatus(tenantA, "suspended");
    try {
      const response = await callHandler("1", { nome: "Ana" }, cookie);
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({ code: "FORBIDDEN" });
    } finally {
      await setTenantStatus(tenantA, "active");
    }
  });

  it("Response devolvido pela função sai como está (ex.: redirect para URL pré-assinada)", async () => {
    const response = await callHandler("redirect", { nome: "Ana" }, cookie);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(`${BASE_URL}/arquivo`);
  });

  it("erro inesperado sobe (o Next responde 500)", async () => {
    await expect(callHandler("bug", { nome: "Ana" }, cookie)).rejects.toThrow("erro inesperado");
  });
});
