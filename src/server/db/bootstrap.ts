import pg from "pg";
import { DB_ROLES, parseConnectionUrl, type ConnectionInfo } from "./roles.ts";

export type BootstrapOptions = {
  /** Superusuário (ou papel com CREATEROLE e CREATEDB). Só usado aqui, nunca pela aplicação. */
  adminUrl: string;
  ownerUrl: string;
  appUrl: string;
  platformUrl: string;
  authUrl: string;
};

const ROLE_ATTRIBUTES = "LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS";

function expectRole(info: ConnectionInfo, expected: string, variable: string): void {
  if (info.user !== expected) {
    throw new Error(`${variable} deve usar o papel ${expected} (encontrado: ${info.user})`);
  }
}

async function ensureRole(admin: pg.Client, info: ConnectionInfo): Promise<void> {
  const name = admin.escapeIdentifier(info.user);
  const password = admin.escapeLiteral(info.password);
  const { rowCount } = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [info.user]);
  // Em papel já existente, reaplica os atributos: remove BYPASSRLS/SUPERUSER dados por engano.
  const verb = rowCount ? "ALTER" : "CREATE";
  await admin.query(`${verb} ROLE ${name} WITH ${ROLE_ATTRIBUTES} PASSWORD ${password}`);
}

/**
 * Cria (ou corrige) os papéis e a base do orbi. Idempotente: pode rodar a cada deploy.
 * - Papéis com senha tirada das próprias URLs, todos sem BYPASSRLS.
 * - Base pertencente a orbi_owner; só orbi_app, orbi_platform e orbi_auth recebem CONNECT.
 */
export async function bootstrapDatabase(options: BootstrapOptions): Promise<{ database: string }> {
  const owner = parseConnectionUrl(options.ownerUrl);
  const app = parseConnectionUrl(options.appUrl);
  const platform = parseConnectionUrl(options.platformUrl);
  const auth = parseConnectionUrl(options.authUrl);
  expectRole(owner, DB_ROLES.owner, "DATABASE_URL_OWNER");
  expectRole(app, DB_ROLES.app, "DATABASE_URL");
  expectRole(platform, DB_ROLES.platform, "DATABASE_URL_PLATFORM");
  expectRole(auth, DB_ROLES.auth, "DATABASE_URL_AUTH");
  if ([app, platform, auth].some((role) => role.database !== owner.database)) {
    throw new Error(
      "DATABASE_URL, DATABASE_URL_OWNER, DATABASE_URL_PLATFORM e DATABASE_URL_AUTH devem usar a mesma base",
    );
  }

  const admin = new pg.Client({ connectionString: options.adminUrl });
  await admin.connect();
  try {
    for (const role of [owner, app, platform, auth]) {
      await ensureRole(admin, role);
    }

    const database = admin.escapeIdentifier(owner.database);
    const ownerRole = admin.escapeIdentifier(DB_ROLES.owner);
    const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      owner.database,
    ]);
    if (rowCount) {
      await admin.query(`ALTER DATABASE ${database} OWNER TO ${ownerRole}`);
    } else {
      await admin.query(`CREATE DATABASE ${database} OWNER ${ownerRole} ENCODING 'UTF8'`);
    }

    await admin.query(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC`);
    const connectRoles = [DB_ROLES.app, DB_ROLES.platform, DB_ROLES.auth]
      .map((role) => admin.escapeIdentifier(role))
      .join(", ");
    await admin.query(`GRANT CONNECT ON DATABASE ${database} TO ${connectRoles}`);
    return { database: owner.database };
  } finally {
    await admin.end();
  }
}
