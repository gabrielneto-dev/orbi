import { hashPassword } from "better-auth/crypto";
import { accounts, users, USER_ROLES, type UserRole } from "../db/schema/index.ts";
import { createBetterAuth, type AuthOptions } from "./auth.ts";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./config.ts";

/** Usuário autenticado, como o resto da aplicação o enxerga (sem nada do Better Auth). */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  /** Nulo só para `admin_plataforma`. */
  tenantId: string | null;
  roles: UserRole[];
  active: boolean;
};

export type AuthSession = {
  user: AuthUser;
  session: { id: string; expiresAt: Date };
};

export type NewUserInput = {
  name: string;
  email: string;
  password: string;
  tenantId: string | null;
  roles: UserRole[];
};

export class InvalidNewUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidNewUserError";
  }
}

function toRoles(value: unknown): UserRole[] {
  if (!Array.isArray(value)) return [];
  return value.filter((role): role is UserRole => USER_ROLES.includes(role as UserRole));
}

/**
 * Módulo de autenticação: a única fronteira entre o orbi e o Better Auth (plan.md › Structure).
 * Recebe a conexão orbi_auth; nada aqui usa withTenant().
 */
export function createAuthModule(options: AuthOptions) {
  const auth = createBetterAuth(options);
  const { db } = options;

  return {
    /** Atende /api/auth/* (login, logout, sessão). */
    handle: (request: Request): Promise<Response> => auth.handler(request),

    /** Sessão válida dos cookies da requisição, ou `null` (sem sessão, expirada ou encerrada). */
    async getSession(headers: Headers): Promise<AuthSession | null> {
      const result = await auth.api.getSession({ headers });
      if (!result) return null;
      const { user, session } = result;
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId ?? null,
          roles: toRoles(user.roles),
          active: user.active !== false,
        },
        session: { id: session.id, expiresAt: new Date(session.expiresAt) },
      };
    },

    /**
     * Cria usuário com login por e-mail e senha (hash scrypt; a senha em texto nunca é gravada).
     * Para a plataforma (primeiro gestor, T015) e para a gestão de usuários (T016).
     */
    async createUserWithPassword(input: NewUserInput): Promise<{ id: string }> {
      const email = input.email.trim().toLowerCase();
      const name = input.name.trim();
      if (!name) throw new InvalidNewUserError("Informe o nome");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new InvalidNewUserError("E-mail inválido");
      if (
        input.password.length < MIN_PASSWORD_LENGTH ||
        input.password.length > MAX_PASSWORD_LENGTH
      ) {
        throw new InvalidNewUserError(
          `A senha deve ter entre ${MIN_PASSWORD_LENGTH} e ${MAX_PASSWORD_LENGTH} caracteres`,
        );
      }
      const roles = [...new Set(input.roles)];
      if (roles.length === 0) throw new InvalidNewUserError("Informe ao menos um perfil");
      const isPlatform = roles.includes("admin_plataforma");
      if (isPlatform !== (input.tenantId === null) || (isPlatform && roles.length > 1)) {
        throw new InvalidNewUserError(
          "admin_plataforma não pertence a empresa; os demais perfis exigem empresa",
        );
      }

      const passwordHash = await hashPassword(input.password);
      return db.transaction(async (tx) => {
        const [created] = await tx
          .insert(users)
          .values({ name, email, tenantId: input.tenantId, roles })
          .returning({ id: users.id });
        if (!created) throw new Error("Falha ao criar usuário");
        await tx.insert(accounts).values({
          userId: created.id,
          accountId: created.id,
          providerId: "credential",
          password: passwordHash,
        });
        return created;
      });
    },
  };
}

export type AuthModule = ReturnType<typeof createAuthModule>;
