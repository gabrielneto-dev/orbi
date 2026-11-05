-- Isolamento entre empresas (SPEC-0001-T006, REQ-061, REQ-064). Migração manual, roda como orbi_owner.
-- Modelo: toda tabela com tenant_id tem RLS ENABLE + FORCE e a política tenant_isolation, que
-- compara tenant_id com app.tenant_id, definido por withTenant() via set_config(..., true)
-- (vale só na transação). Sem app.tenant_id definido, as consultas retornam zero linhas.

-- Empresa da transação atual, ou NULL quando não definida. Depois que uma transação com
-- set_config(..., true) termina, a conexão (reaproveitada pelo pool) volta a ter app.tenant_id = ''
-- em vez de "não definido": o NULLIF trata os dois casos como "nenhuma empresa" (zero linhas)
-- em vez de erro de conversão para uuid.
CREATE FUNCTION public.current_tenant_id() RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT nullif(current_setting('app.tenant_id', true), '')::uuid
$$;
--> statement-breakpoint

COMMENT ON FUNCTION public.current_tenant_id() IS 'Empresa da transação (app.tenant_id, definido por withTenant()); NULL quando não definida.';
--> statement-breakpoint

-- Política RLS padrão. Use em toda migração que cria tabela com tenant_id:
--   CALL public.enable_tenant_rls('public.<tabela>');
-- A política vale para PUBLIC (inclusive o dono, por causa do FORCE): nenhum papel lê ou grava
-- linhas de outra empresa, e o WITH CHECK impede inserir ou mover linhas para outra empresa.
-- Os privilégios de orbi_app (GRANT) continuam explícitos em cada migração.
CREATE PROCEDURE public.enable_tenant_rls(target regclass)
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', target);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', target);
  EXECUTE format(
    'CREATE POLICY tenant_isolation ON %s AS PERMISSIVE FOR ALL TO PUBLIC '
    'USING (tenant_id = public.current_tenant_id()) '
    'WITH CHECK (tenant_id = public.current_tenant_id())',
    target
  );
END
$$;
--> statement-breakpoint

-- Só migrações (orbi_owner) aplicam a política; a aplicação não tem por que chamar.
REVOKE EXECUTE ON PROCEDURE public.enable_tenant_rls(regclass) FROM PUBLIC;
--> statement-breakpoint

-- tenants não tem tenant_id: a própria linha é a empresa. RLS forçado com políticas por papel.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

-- orbi_app lê só a própria empresa (nome, situação suspensa para REQ-063). Não grava.
CREATE POLICY tenant_isolation ON public.tenants AS PERMISSIVE FOR SELECT TO orbi_app
  USING (id = public.current_tenant_id());
--> statement-breakpoint
GRANT SELECT ON public.tenants TO orbi_app;
--> statement-breakpoint

-- orbi_platform (admin_plataforma, REQ-062) cria, suspende e reativa empresas; não apaga (REQ-063:
-- dados preservados). Não recebe privilégio em nenhuma tabela de dados de empresa.
CREATE POLICY platform_manage ON public.tenants AS PERMISSIVE FOR ALL TO orbi_platform
  USING (true)
  WITH CHECK (true);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON public.tenants TO orbi_platform;
