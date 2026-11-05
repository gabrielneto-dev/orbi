// Rotas do Better Auth (login, logout, sessão). A lógica fica em src/server/auth.
import { authRouteHandlers } from "@/server/auth";

export const { GET, POST } = authRouteHandlers;
