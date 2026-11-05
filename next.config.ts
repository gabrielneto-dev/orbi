import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AGENTS.md é o contrato do projeto: o `next dev` não deve reescrevê-lo
  // (a orientação equivalente está na seção "Commands" do AGENTS.md).
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
