// Carrega o .env local nos testes de integração. No CI as variáveis vêm do ambiente.
try {
  process.loadEnvFile(".env");
} catch {
  // Sem .env: segue com o ambiente atual.
}
