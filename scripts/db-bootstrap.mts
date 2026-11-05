// pnpm db:bootstrap — cria/corrige papéis e base (idempotente). Requer DATABASE_URL_ADMIN.
import { bootstrapDatabase } from "../src/server/db/bootstrap.ts";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} não definida (veja .env.example)`);
  return value;
}

try {
  const { database } = await bootstrapDatabase({
    adminUrl: required("DATABASE_URL_ADMIN"),
    ownerUrl: required("DATABASE_URL_OWNER"),
    appUrl: required("DATABASE_URL"),
    platformUrl: required("DATABASE_URL_PLATFORM"),
  });
  console.log(
    `Bootstrap concluído: papéis orbi_owner/orbi_app/orbi_platform e base "${database}".`,
  );
} catch (error) {
  console.error(`Bootstrap falhou: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
