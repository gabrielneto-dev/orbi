import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.ts";
import { accounts, rateLimits, sessions, users, verifications } from "../db/schema/index.ts";
import {
  DEFAULT_IDLE_TIMEOUT_MINUTES,
  LOGIN_RATE_LIMIT,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  sessionTimings,
} from "./config.ts";

export type AuthOptions = {
  /** Conexão com o papel orbi_auth (DATABASE_URL_AUTH). */
  db: Database;
  secret: string;
  /** URL pública da aplicação. Com https://, os cookies saem com Secure e prefixo __Secure-. */
  baseURL: string;
  idleTimeoutMinutes?: number;
};

/**
 * Instância do Better Auth do orbi (plan.md › Security and privacy, REQ-001, REQ-049).
 * Só este diretório importa a biblioteca (regra de lint); o resto do código usa `getSession()`.
 */
export function createBetterAuth(options: AuthOptions) {
  const { db, secret, baseURL } = options;
  const { expiresIn, updateAge } = sessionTimings(
    options.idleTimeoutMinutes ?? DEFAULT_IDLE_TIMEOUT_MINUTES,
  );
  const secure = baseURL.startsWith("https://") || process.env.NODE_ENV === "production";

  return betterAuth({
    appName: "orbi",
    secret,
    baseURL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
        rateLimit: rateLimits,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Sem cadastro público: usuários são criados pelo gestor ou pela plataforma (T015/T016).
      disableSignUp: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
      // Hash: scrypt, padrão do Better Auth (salt aleatório por senha).
    },
    user: {
      additionalFields: {
        // input: false — nenhuma rota pública altera empresa, perfis ou situação do usuário.
        tenantId: { type: "string", required: false, input: false },
        roles: { type: "string[]", required: false, input: false, defaultValue: [] },
        active: { type: "boolean", required: false, input: false, defaultValue: true },
      },
    },
    // Expiração por inatividade; sem cache de sessão em cookie, para que logout, desativação
    // e expiração valham na próxima requisição.
    session: { expiresIn, updateAge },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: { "/sign-in/email": { ...LOGIN_RATE_LIMIT } },
    },
    advanced: {
      useSecureCookies: secure,
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure },
      // IDs gerados pelo banco (uuid_generate_v7), como no resto do schema.
      database: { generateId: false },
    },
    databaseHooks: {
      session: {
        create: {
          // Usuário desativado não entra (REQ-003, AC-003).
          before: async (session) => {
            const [user] = await db
              .select({ active: users.active })
              .from(users)
              .where(eq(users.id, session.userId));
            if (!user?.active) {
              throw APIError.from("FORBIDDEN", {
                code: "USER_INACTIVE",
                message: "Usuário desativado",
              });
            }
          },
        },
      },
    },
    telemetry: { enabled: false },
    // Deve ser o último plugin: grava os cookies quando o login roda numa Server Action.
    plugins: [nextCookies()],
  });
}

export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;
