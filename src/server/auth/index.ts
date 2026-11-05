// API pública da autenticação. O resto do código importa daqui, nunca do Better Auth.
import { createDatabase } from "../db/client.ts";
import { parseIdleTimeoutMinutes } from "./config.ts";
import {
  createAuthModule,
  type AuthModule,
  type AuthSession,
  type NewUserInput,
} from "./module.ts";

export type { AuthModule, AuthSession, AuthUser, NewUserInput } from "./module.ts";
export { InvalidNewUserError, createAuthModule } from "./module.ts";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} não definida (veja .env.example)`);
  return value;
}

// Em globalThis para o hot reload do `next dev` não recriar o pool a cada edição.
const globalForAuth = globalThis as typeof globalThis & { __orbiAuth?: AuthModule };

/** Módulo de autenticação da aplicação, configurado pelo ambiente. */
export function getAuthModule(): AuthModule {
  if (!globalForAuth.__orbiAuth) {
    globalForAuth.__orbiAuth = createAuthModule({
      db: createDatabase(required("DATABASE_URL_AUTH")).db,
      secret: required("BETTER_AUTH_SECRET"),
      baseURL: required("BETTER_AUTH_URL"),
      idleTimeoutMinutes: parseIdleTimeoutMinutes(process.env.SESSION_IDLE_TIMEOUT_MINUTES),
    });
  }
  return globalForAuth.__orbiAuth;
}

/**
 * Sessão da requisição atual (cookies). Sem argumento, lê os cabeçalhos do Next.js
 * (Server Components, Server Actions, route handlers).
 */
export async function getSession(requestHeaders?: Headers): Promise<AuthSession | null> {
  let source = requestHeaders;
  if (!source) {
    const { headers } = await import("next/headers");
    source = new Headers(await headers());
  }
  return getAuthModule().getSession(source);
}

export function createUserWithPassword(input: NewUserInput) {
  return getAuthModule().createUserWithPassword(input);
}

/** Handlers de /api/auth/[...all]. */
export const authRouteHandlers = {
  GET: (request: Request) => getAuthModule().handle(request),
  POST: (request: Request) => getAuthModule().handle(request),
};
