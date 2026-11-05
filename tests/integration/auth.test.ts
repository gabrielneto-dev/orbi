import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type pg from "pg";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createAuthModule, InvalidNewUserError, type AuthModule } from "@/server/auth";
import { createDatabase, type Database } from "@/server/db/client.ts";
import { users } from "@/server/db/schema/index.ts";
import { withTenant } from "@/server/db/tenant.ts";
import { createTestDatabase, withClient, type TestDatabase } from "./support/test-database.ts";

// SPEC-0001-T008 / REQ-001, REQ-049: login/logout, hash de senha, cookies, expiração, rate limit.

const BASE_URL = "https://orbi.test";
const SESSION_COOKIE = "__Secure-better-auth.session_token";
const PASSWORD = "senha-forte-123";

let testDb: TestDatabase;
let authConnection: { db: Database; pool: pg.Pool };
let appConnection: { db: Database; pool: pg.Pool };
let auth: AuthModule;
let tenantA: string;
let tenantB: string;
let ipCounter = 0;

/** IP novo por teste, para o rate limit de um teste não afetar outro. */
const nextIp = () => `203.0.113.${++ipCounter}`;

function post(path: string, body: unknown, init: { ip: string; cookie?: string }) {
  const headers = new Headers({
    "content-type": "application/json",
    origin: BASE_URL,
    "x-forwarded-for": init.ip,
  });
  if (init.cookie) headers.set("cookie", init.cookie);
  return auth.handle(
    new Request(`${BASE_URL}/api/auth${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
}

function signIn(email: string, password: string, ip = nextIp()) {
  return post("/sign-in/email", { email, password }, { ip });
}

/** Cabeçalho `cookie` com o token de sessão devolvido no login. */
function sessionCookie(response: Response): string {
  const cookie = response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) throw new Error("Login não devolveu o cookie de sessão");
  return cookie.split(";")[0] ?? "";
}

const sessionFor = (cookie: string) => auth.getSession(new Headers({ cookie }));

async function newUser(roles: ("gestor" | "tecnico")[] = ["gestor"], tenantId = tenantA) {
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
    idleTimeoutMinutes: 480,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

afterAll(async () => {
  await authConnection?.pool.end();
  await appConnection?.pool.end();
  await testDb?.drop();
});

describe("login e logout", () => {
  it("login com e-mail e senha abre sessão com empresa e perfis do usuário", async () => {
    const { id, email } = await newUser(["gestor", "tecnico"]);
    const response = await signIn(email, PASSWORD);
    expect(response.status).toBe(200);

    const session = await sessionFor(sessionCookie(response));
    expect(session?.user).toEqual({
      id,
      name: "Pessoa Teste",
      email,
      tenantId: tenantA,
      roles: ["gestor", "tecnico"],
      active: true,
    });
  });

  it("cookie de sessão é HttpOnly, Secure e SameSite=Lax", async () => {
    const { email } = await newUser();
    const response = await signIn(email, PASSWORD);
    const cookie = response.headers
      .getSetCookie()
      .find((value) => value.startsWith(`${SESSION_COOKIE}=`));
    expect(cookie).toMatch(/;\s*HttpOnly/i);
    expect(cookie).toMatch(/;\s*Secure/i);
    expect(cookie).toMatch(/;\s*SameSite=Lax/i);
  });

  it("senha errada ou e-mail inexistente → 401, sem cookie", async () => {
    const { email } = await newUser();
    for (const response of [
      await signIn(email, "senha-errada-1"),
      await signIn("ninguem@empresa.test", PASSWORD),
    ]) {
      expect(response.status).toBe(401);
      expect(response.headers.getSetCookie()).toEqual([]);
    }
  });

  it("logout encerra a sessão no servidor", async () => {
    const { id, email } = await newUser();
    const cookie = sessionCookie(await signIn(email, PASSWORD));
    expect(await sessionFor(cookie)).not.toBeNull();

    const response = await post("/sign-out", {}, { ip: nextIp(), cookie });
    expect(response.status).toBe(200);
    expect(await sessionFor(cookie)).toBeNull();

    const { rows } = await withClient(testDb.catalogUrl, (client) =>
      client.query("SELECT id FROM public.sessions WHERE user_id = $1", [id]),
    );
    expect(rows).toEqual([]);
  });

  it("sem cookie ou com token inventado, não há sessão", async () => {
    expect(await auth.getSession(new Headers())).toBeNull();
    expect(await sessionFor(`${SESSION_COOKIE}=token-inventado.assinatura`)).toBeNull();
  });

  it("usuário desativado não consegue entrar (403) e nenhuma sessão é criada", async () => {
    const { id, email } = await newUser();
    await authConnection.db.update(users).set({ active: false }).where(eq(users.id, id));

    const response = await signIn(email, PASSWORD);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "USER_INACTIVE" });

    const { rows } = await withClient(testDb.catalogUrl, (client) =>
      client.query("SELECT id FROM public.sessions WHERE user_id = $1", [id]),
    );
    expect(rows).toEqual([]);
  });

  it("não existe cadastro público", async () => {
    const email = "intruso@empresa.test";
    const response = await post(
      "/sign-up/email",
      { name: "Intruso", email, password: PASSWORD },
      { ip: nextIp() },
    );
    expect(response.ok).toBe(false);
    const found = await authConnection.db.select().from(users).where(eq(users.email, email));
    expect(found).toEqual([]);
  });
});

describe("senha", () => {
  it("é armazenada só como hash scrypt com salt, nunca em texto", async () => {
    const first = await newUser();
    const second = await newUser();
    const { rows } = await withClient(testDb.catalogUrl, (client) =>
      client.query<{ password: string }>(
        `SELECT password FROM public.accounts WHERE user_id = ANY($1) AND provider_id = 'credential'`,
        [[first.id, second.id]],
      ),
    );
    expect(rows).toHaveLength(2);
    for (const { password } of rows) {
      expect(password).not.toContain(PASSWORD);
      expect(password).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/); // salt:hash (scrypt, 64 bytes)
    }
    // Mesma senha, hashes diferentes (salt aleatório).
    expect(rows[0]?.password).not.toBe(rows[1]?.password);

    const columns = await withClient(testDb.catalogUrl, (client) =>
      client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name ILIKE '%pass%'`,
      ),
    );
    expect(columns.rows).toEqual([]);
  });
});

describe("expiração por inatividade (8 horas)", () => {
  it("sessão usada continua válida; após 8 h sem uso, expira", async () => {
    const { email } = await newUser();
    vi.useFakeTimers({ toFake: ["Date"] });
    const start = Date.now();
    vi.setSystemTime(start);
    const cookie = sessionCookie(await signIn(email, PASSWORD));

    // Uso a cada 7 h: a sessão é renovada e continua válida, mesmo 14 h depois do login.
    vi.setSystemTime(start + 7 * 3_600_000);
    expect(await sessionFor(cookie)).not.toBeNull();
    vi.setSystemTime(start + 14 * 3_600_000);
    expect(await sessionFor(cookie)).not.toBeNull();

    // 8 h e 1 min sem uso depois do último acesso: expirou.
    vi.setSystemTime(start + 22 * 3_600_000 + 60_000);
    expect(await sessionFor(cookie)).toBeNull();
  });

  it("sem nenhum uso, expira logo depois de 8 h", async () => {
    const { email } = await newUser();
    vi.useFakeTimers({ toFake: ["Date"] });
    const start = Date.now();
    vi.setSystemTime(start);
    const cookie = sessionCookie(await signIn(email, PASSWORD));

    vi.setSystemTime(start + 8 * 3_600_000 + 60_000);
    expect(await sessionFor(cookie)).toBeNull();
  });
});

describe("rate limit de login", () => {
  it("a 6ª tentativa no mesmo minuto e IP é bloqueada (429), mesmo com a senha certa", async () => {
    const { email } = await newUser();
    const ip = nextIp();
    for (let attempt = 1; attempt <= 5; attempt++) {
      expect((await signIn(email, "senha-errada-1", ip)).status).toBe(401);
    }
    expect((await signIn(email, PASSWORD, ip)).status).toBe(429);
    // Outro IP não é afetado.
    expect((await signIn(email, PASSWORD, nextIp())).status).toBe(200);
  });
});

describe("acesso às tabelas de autenticação", () => {
  it("orbi_app não lê sessões, contas (hash de senha), verificações nem rate limit", async () => {
    for (const table of ["sessions", "accounts", "verifications", "rate_limits"]) {
      await expect(
        withClient(testDb.appUrl, (client) => client.query(`SELECT * FROM public.${table}`)),
      ).rejects.toMatchObject({ code: "42501" });
    }
  });

  it("orbi_app vê só os usuários da própria empresa, e nenhum sem empresa definida", async () => {
    const fromA = await newUser(["gestor"], tenantA);
    const fromB = await newUser(["gestor"], tenantB);
    const seenByA = await withTenant(tenantA, (tx) => tx.select().from(users), {
      db: appConnection.db,
    });
    const ids = seenByA.map((user) => user.id);
    expect(ids).toContain(fromA.id);
    expect(ids).not.toContain(fromB.id);
    expect(seenByA.every((user) => user.tenantId === tenantA)).toBe(true);
    expect(await appConnection.db.select().from(users)).toEqual([]);
  });

  it("orbi_app não grava usuários", async () => {
    await expect(
      withTenant(
        tenantA,
        (tx) =>
          tx
            .update(users)
            .set({ roles: ["gestor"] })
            .where(eq(users.tenantId, tenantA)),
        { db: appConnection.db },
      ),
    ).rejects.toMatchObject({ cause: { code: "42501" } });
  });
});

describe("createUserWithPassword", () => {
  it("valida empresa × perfil, senha e e-mail", async () => {
    const base = { name: "Fulano", email: "fulano@empresa.test", password: PASSWORD };
    const invalid = [
      { ...base, tenantId: null, roles: ["gestor" as const] },
      { ...base, tenantId: tenantA, roles: ["admin_plataforma" as const] },
      { ...base, tenantId: tenantA, roles: [] },
      { ...base, tenantId: tenantA, roles: ["gestor" as const], password: "curta" },
      { ...base, tenantId: tenantA, roles: ["gestor" as const], email: "sem-arroba" },
      { ...base, tenantId: tenantA, roles: ["gestor" as const], name: " " },
    ];
    for (const input of invalid) {
      await expect(auth.createUserWithPassword(input)).rejects.toBeInstanceOf(InvalidNewUserError);
    }
  });

  it("e-mail é único na plataforma, sem diferenciar maiúsculas", async () => {
    const { email } = await newUser(["gestor"], tenantA);
    await expect(
      auth.createUserWithPassword({
        name: "Outra",
        email: email.toUpperCase(),
        password: PASSWORD,
        tenantId: tenantB,
        roles: ["gestor"],
      }),
    ).rejects.toMatchObject({ cause: { code: "23505" } });
  });

  it("admin_plataforma é criado sem empresa e entra normalmente", async () => {
    const email = "admin@orbi.test";
    await auth.createUserWithPassword({
      name: "Admin",
      email,
      password: PASSWORD,
      tenantId: null,
      roles: ["admin_plataforma"],
    });
    const session = await sessionFor(sessionCookie(await signIn(email, PASSWORD)));
    expect(session?.user).toMatchObject({ tenantId: null, roles: ["admin_plataforma"] });
  });
});
