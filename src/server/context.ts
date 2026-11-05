import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getSession, type AuthSession } from "./auth/index.ts";
import { getDb, type Database } from "./db/client.ts";
import { tenants, type UserRole } from "./db/schema/index.ts";
import { withTenant, type TenantTransaction } from "./db/tenant.ts";
import {
  AppError,
  fieldErrorsFromZod,
  forbidden,
  httpStatusFor,
  unauthenticated,
  validationFailed,
  type ActionResult,
} from "./result.ts";

/** Quem faz a requisição, já validado (plan.md › Fluxos principais, item 1). */
export type RequestContext = {
  user: { id: string; name: string; email: string };
  tenantId: string;
  roles: UserRole[];
  /** Executa `fn` numa transação restrita à empresa do usuário (RLS, REQ-061). */
  withTenant: <T>(fn: (tx: TenantTransaction) => Promise<T>) => Promise<T>;
};

export type ContextDeps = {
  /** Sessão dos cookies. Sem argumento, lê os cabeçalhos do Next.js (Server Actions). */
  getSession: (headers?: Headers) => Promise<AuthSession | null>;
  /** Conexão `orbi_app`. */
  db: Database;
};

/**
 * Monta o contexto ou lança o erro padronizado:
 * sem sessão → UNAUTHENTICATED; usuário desativado (REQ-003), sem empresa (admin_plataforma,
 * que usa o módulo da plataforma) ou empresa suspensa (REQ-063) → FORBIDDEN.
 * A situação do usuário e da empresa é lida a cada requisição: desativar ou suspender vale
 * para quem já está logado, na próxima ação.
 */
export async function buildRequestContext(
  session: AuthSession | null,
  db: Database,
): Promise<RequestContext> {
  if (!session) throw unauthenticated();
  const { user } = session;
  if (!user.active) throw forbidden("Usuário desativado. Fale com o gestor da sua empresa.");
  const tenantId = user.tenantId;
  if (!tenantId || user.roles.includes("admin_plataforma")) {
    throw forbidden("Esta área é exclusiva dos usuários das empresas");
  }

  const [tenant] = await withTenant(
    tenantId,
    (tx) => tx.select({ status: tenants.status }).from(tenants).where(eq(tenants.id, tenantId)),
    { db },
  );
  if (tenant?.status !== "active") {
    throw forbidden("Empresa suspensa. Fale com o suporte do orbi.");
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    tenantId,
    roles: user.roles,
    withTenant: (fn) => withTenant(tenantId, fn, { db }),
  };
}

function parseWith<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw validationFailed(fieldErrorsFromZod(parsed.error));
  return parsed.data;
}

/** Erros esperados (AppError) viram resultado; os demais sobem (inclui redirect/notFound do Next). */
async function toResult<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (error instanceof AppError) return error.toResult();
    throw error;
  }
}

type RouteParams = Record<string, string | string[] | undefined>;

/** Cria `action()` e `handler()` com dependências injetáveis (testes usam conexões próprias). */
export function createWrappers(resolveDeps: () => ContextDeps) {
  /**
   * Server Action protegida: sessão → contexto → validação Zod da entrada → `fn`.
   * Toda Server Action do orbi passa por aqui (regra de lint da T010).
   */
  function action<O, S extends z.ZodType = z.ZodUndefined>(
    options: { input?: S },
    fn: (args: { ctx: RequestContext; input: z.output<S> }) => Promise<O>,
  ): (input?: z.input<S>) => Promise<ActionResult<O>> {
    return async (rawInput?: z.input<S>) =>
      toResult(async () => {
        const deps = resolveDeps();
        const ctx = await buildRequestContext(await deps.getSession(), deps.db);
        const input = options.input ? parseWith(options.input, rawInput) : undefined;
        return fn({ ctx, input: input as z.output<S> });
      });
  }

  /**
   * Route handler protegido. Responde JSON `{ ok, data | code, message, fields }` com o status
   * HTTP do código (401/403/404/409/422); se `fn` devolver um `Response`, ele sai como está.
   */
  function handler<O, P extends RouteParams = RouteParams, S extends z.ZodType = z.ZodUndefined>(
    options: { body?: S },
    fn: (args: {
      ctx: RequestContext;
      request: Request;
      params: P;
      body: z.output<S>;
    }) => Promise<O | Response>,
  ): (request: Request, route: { params: Promise<P> }) => Promise<Response> {
    return async (request, route) => {
      let passthrough: Response | undefined;
      const result = await toResult(async () => {
        const deps = resolveDeps();
        const ctx = await buildRequestContext(await deps.getSession(request.headers), deps.db);
        let body: unknown;
        if (options.body) {
          const raw: unknown = await request.json().catch(() => {
            throw validationFailed({ "": ["Corpo da requisição não é um JSON válido"] });
          });
          body = parseWith(options.body, raw);
        }
        const output = await fn({
          ctx,
          request,
          params: await route.params,
          body: body as z.output<S>,
        });
        if (output instanceof Response) passthrough = output;
        return output as O;
      });
      return passthrough ?? Response.json(result, { status: httpStatusFor(result) });
    };
  }

  return { action, handler };
}

/** Wrappers da aplicação: sessão do Better Auth e conexão `orbi_app`. */
export const { action, handler } = createWrappers(() => ({ getSession, db: getDb() }));
