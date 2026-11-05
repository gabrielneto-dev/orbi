import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Situação da empresa assinante. `suspended` bloqueia o login dos usuários (REQ-063). */
export const TENANT_STATUSES = ["active", "suspended"] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

/**
 * Empresas assinantes (plan.md › Data model). Não tem `tenant_id`: a própria linha é a empresa.
 * RLS forçado na migração 0002: `orbi_app` só enxerga a empresa de `app.tenant_id`;
 * `orbi_platform` cria, suspende e reativa empresas (REQ-062).
 */
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`public.uuid_generate_v7()`),
    name: text("name").notNull(),
    cnpj: text("cnpj").notNull(),
    status: text("status", { enum: TENANT_STATUSES }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("tenants_status_check", sql`${table.status} IN ('active', 'suspended')`)],
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
