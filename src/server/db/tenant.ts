import { sql } from "drizzle-orm";
import { getDb, type Database } from "./client.ts";

/** Transação aberta por `withTenant()`: todas as consultas nela ficam restritas à empresa. */
export type TenantTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidTenantIdError extends Error {
  constructor() {
    super("tenantId inválido: esperado um UUID");
    this.name = "InvalidTenantIdError";
  }
}

/**
 * Executa `fn` numa transação restrita à empresa `tenantId` (REQ-061).
 *
 * Define `app.tenant_id` com `set_config(..., true)`, que vale só nesta transação: ao terminar
 * (commit ou rollback), a conexão volta ao pool sem empresa, e consultas fora de `withTenant()`
 * retornam zero linhas nas tabelas com RLS. Erro em `fn` desfaz a transação inteira.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: TenantTransaction) => Promise<T>,
  options: { db?: Database } = {},
): Promise<T> {
  if (!UUID_PATTERN.test(tenantId)) throw new InvalidTenantIdError();
  const db = options.db ?? getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
    return fn(tx);
  });
}
