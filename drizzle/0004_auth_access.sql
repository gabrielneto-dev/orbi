-- Acesso às tabelas do Better Auth (SPEC-0001-T008, REQ-001, REQ-049, REQ-061). Migração manual,
-- roda como orbi_owner. Decisão: CTX-DEC-20261105-auth-db-role.
--
-- O login e a validação de sessão acontecem antes de se saber a empresa do usuário, então o
-- módulo de autenticação (src/server/auth) conecta com um papel próprio, orbi_auth, que enxerga
-- usuários e sessões de todas as empresas. O resto da aplicação (orbi_app) continua sob RLS:
-- vê só os usuários da empresa da transação e não tem acesso a sessões nem a hashes de senha.

-- users tem tenant_id: política padrão (vale para PUBLIC, inclusive orbi_app) ...
CALL public.enable_tenant_rls('public.users');
--> statement-breakpoint
-- ... e uma política extra só para orbi_auth (políticas permissivas se somam com OR).
CREATE POLICY auth_access ON public.users AS PERMISSIVE FOR ALL TO orbi_auth
  USING (true)
  WITH CHECK (true);
--> statement-breakpoint
-- Sem DELETE: usuário é desativado, nunca apagado (AC-003: OS continuam mostrando o nome).
GRANT SELECT, INSERT, UPDATE ON public.users TO orbi_auth;
--> statement-breakpoint
-- Leitura dos usuários da própria empresa (nomes em OS, gestão de usuários). Gravação de usuários
-- passa pelo módulo de autenticação.
GRANT SELECT ON public.users TO orbi_app;
--> statement-breakpoint

-- Tabelas sem tenant_id, exclusivas do módulo de autenticação. RLS forçado com política só para
-- orbi_auth: se um GRANT a outro papel for adicionado por engano, ele continua vendo zero linhas.
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.sessions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY auth_access ON public.sessions AS PERMISSIVE FOR ALL TO orbi_auth USING (true) WITH CHECK (true);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO orbi_auth;
--> statement-breakpoint

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY auth_access ON public.accounts AS PERMISSIVE FOR ALL TO orbi_auth USING (true) WITH CHECK (true);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO orbi_auth;
--> statement-breakpoint

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.verifications FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY auth_access ON public.verifications AS PERMISSIVE FOR ALL TO orbi_auth USING (true) WITH CHECK (true);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verifications TO orbi_auth;
--> statement-breakpoint

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.rate_limits FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY auth_access ON public.rate_limits AS PERMISSIVE FOR ALL TO orbi_auth USING (true) WITH CHECK (true);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limits TO orbi_auth;
