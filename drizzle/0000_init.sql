-- Migração inicial (SPEC-0001-T005). Roda como orbi_owner (pnpm db:migrate).
-- Os papéis orbi_owner/orbi_app/orbi_platform e a própria base são criados pelo bootstrap
-- (pnpm db:bootstrap, com superusuário), porque papéis valem para o servidor inteiro.

-- Só o dono da base (orbi_owner) cria objetos no schema public. É o padrão do PostgreSQL 15+,
-- repetido aqui para não depender da origem do banco (ex.: restauração de backup antigo).
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
--> statement-breakpoint

-- Chaves UUID v7 (ordenáveis por tempo), convenção do plan.md › Data model.
-- O PostgreSQL 17 ainda não tem uuidv7() nativo (chega no 18). Os 48 bits iniciais recebem o
-- instante em milissegundos; versão (7) e variante (10xx) ficam nos bits padronizados (RFC 9562).
CREATE FUNCTION public.uuid_generate_v7() RETURNS uuid
LANGUAGE sql
VOLATILE
PARALLEL SAFE
AS $$
  SELECT encode(
    set_bit(
      set_bit(
        overlay(
          uuid_send(gen_random_uuid())
          PLACING substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3)
          FROM 1 FOR 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex'
  )::uuid
$$;
--> statement-breakpoint

COMMENT ON FUNCTION public.uuid_generate_v7() IS 'UUID v7 (RFC 9562) para chaves primárias; substituir por uuidv7() ao migrar para PostgreSQL 18.';
