import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants.ts";

// Tabelas do Better Auth (plan.md › Data model). Os nomes das chaves JS seguem os campos que o
// Better Auth espera (emailVerified, userId…); as colunas ficam em snake_case.
// Acesso (migração 0004, CTX-DEC-20261105-auth-db-role):
// - orbi_auth (só src/server/auth): lê e grava todas as tabelas daqui;
// - orbi_app: só SELECT em `users`, restrito à empresa por RLS; nenhum acesso a sessões, contas
//   (hash de senha), verificações e rate limit.

const id = () =>
  uuid("id")
    .primaryKey()
    .default(sql`public.uuid_generate_v7()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/** Perfis das empresas (BR-01) e da plataforma (REQ-062). */
export const USER_ROLES = [
  "secretaria",
  "comercial",
  "tecnico",
  "gestor",
  "financeiro",
  "admin_plataforma",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Usuários (login). `tenant_id` nulo só para `admin_plataforma`; e-mail único na plataforma
 * (A-11: cada login pertence a uma única empresa).
 */
export const users = pgTable(
  "users",
  {
    id: id(),
    tenantId: uuid("tenant_id").references(() => tenants.id),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    roles: text("roles")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("users_tenant_id_idx").on(table.tenantId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

/** Credenciais. Para e-mail/senha: `provider_id = 'credential'` e `password` = hash scrypt. */
export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    password: text("password"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: id(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

/** Contadores do rate limit do Better Auth (persistem entre reinícios da aplicação). */
export const rateLimits = pgTable("rate_limits", {
  id: id(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export type User = typeof users.$inferSelect;
