// Schema Drizzle do orbi.
// Toda tabela de dados de empresa tem `tenant_id` e RLS forçado (plan.md › Security and privacy):
// na migração que cria a tabela, chame `CALL public.enable_tenant_rls('<tabela>')` e conceda os
// privilégios de `orbi_app` explicitamente. O teste `tests/integration/tenant-isolation.test.ts`
// falha se alguma tabela com `tenant_id` ficar sem RLS.
export * from "./tenants.ts";
