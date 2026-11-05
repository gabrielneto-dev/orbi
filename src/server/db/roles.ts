/**
 * Papéis PostgreSQL do orbi (plan.md › Security and privacy, REQ-061).
 * - owner: dono das tabelas; usado só pelas migrações.
 * - app: conexões da aplicação; sem BYPASSRLS, nunca dono de objetos.
 * - platform: admin_plataforma; acesso restrito (tenants, primeiro gestor, auditoria da plataforma).
 */
export const DB_ROLES = {
  owner: "orbi_owner",
  app: "orbi_app",
  platform: "orbi_platform",
} as const;

export type DbRole = (typeof DB_ROLES)[keyof typeof DB_ROLES];

export type ConnectionInfo = {
  user: string;
  password: string;
  database: string;
};

/** Lê usuário, senha e base de uma URL `postgres://usuario:senha@host:porta/base`. */
export function parseConnectionUrl(url: string): ConnectionInfo {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("URL de conexão PostgreSQL inválida");
  }
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("URL de conexão deve começar com postgres:// ou postgresql://");
  }
  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!user || !password || !database) {
    throw new Error("URL de conexão precisa de usuário, senha e nome da base");
  }
  return { user, password, database };
}

/** Mesma URL apontando para outra base. */
export function withDatabase(url: string, database: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${encodeURIComponent(database)}`;
  return parsed.toString();
}
