import type pg from "pg";
import { DB_ROLES } from "@/server/db/roles.ts";

/**
 * Varredura de RLS (plan.md › Testing strategy, REQ-061): lista toda relação com coluna
 * `tenant_id` que não segue o modelo de isolamento. Retorna uma mensagem por problema; vazio = ok.
 *
 * Regras:
 * - tabela (comum ou particionada, inclusive partições): RLS ENABLE e FORCE; política
 *   `tenant_isolation` permissiva, para PUBLIC, em todos os comandos, com USING e WITH CHECK
 *   `tenant_id = current_tenant_id()`; nenhuma outra política permissiva que valha para a
 *   aplicação (PUBLIC ou orbi_app), porque políticas permissivas se somam com OR;
 * - view: só com `security_invoker` (senão consulta as tabelas como o dono e ignora o RLS);
 * - view materializada: proibida (não suporta RLS).
 */
export async function findRlsViolations(client: pg.Client): Promise<string[]> {
  const relations = await client.query<{
    name: string;
    relkind: string;
    rls: boolean;
    forced: boolean;
    options: string[] | null;
  }>(
    `SELECT format('%I.%I', n.nspname, c.relname) AS name, c.relkind::text AS relkind,
            c.relrowsecurity AS rls, c.relforcerowsecurity AS forced, c.reloptions::text[] AS options
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_attribute a ON a.attrelid = c.oid
      WHERE a.attname = 'tenant_id' AND a.attnum > 0 AND NOT a.attisdropped
        AND c.relkind IN ('r', 'p', 'v', 'm')
        AND n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
      ORDER BY 1`,
  );
  const policies = await client.query<{
    name: string;
    policy: string;
    permissive: string;
    roles: string[];
    cmd: string;
    qual: string | null;
    withCheck: string | null;
  }>(
    `SELECT format('%I.%I', schemaname, tablename) AS name, policyname AS policy, permissive,
            roles::text[] AS roles, cmd, qual, with_check AS "withCheck"
       FROM pg_policies`,
  );

  const tenantExpression = /^\(tenant_id = (public\.)?current_tenant_id\(\)\)$/;
  const appliesToApp = (roles: string[]) =>
    roles.includes("public") || roles.includes(DB_ROLES.app);
  const violations: string[] = [];

  for (const relation of relations.rows) {
    const { name } = relation;
    if (relation.relkind === "m") {
      violations.push(`${name}: view materializada com tenant_id (não suporta RLS)`);
      continue;
    }
    if (relation.relkind === "v") {
      const invoker = (relation.options ?? []).some((option) =>
        /^security_invoker=(true|on|1|yes)$/i.test(option),
      );
      if (!invoker) violations.push(`${name}: view com tenant_id sem security_invoker`);
      continue;
    }

    if (!relation.rls) violations.push(`${name}: RLS não habilitado`);
    if (!relation.forced) violations.push(`${name}: RLS não forçado (FORCE)`);

    const own = policies.rows.filter((policy) => policy.name === name);
    const isolation = own.find((policy) => policy.policy === "tenant_isolation");
    if (
      !isolation ||
      isolation.permissive !== "PERMISSIVE" ||
      isolation.cmd !== "ALL" ||
      isolation.roles.join(",") !== "public" ||
      !tenantExpression.test(isolation.qual ?? "") ||
      !tenantExpression.test(isolation.withCheck ?? "")
    ) {
      violations.push(`${name}: sem a política padrão tenant_isolation (enable_tenant_rls)`);
    }
    for (const policy of own) {
      if (
        policy !== isolation &&
        policy.permissive === "PERMISSIVE" &&
        appliesToApp(policy.roles)
      ) {
        violations.push(
          `${name}: política permissiva extra "${policy.policy}" vale para a aplicação`,
        );
      }
    }
  }
  return violations;
}
