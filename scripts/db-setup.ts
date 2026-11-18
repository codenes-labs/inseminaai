import { readFileSync } from "node:fs";
import { join } from "node:path";
import { aplicarMigrations } from "../src/server/db/migrate";
import { aplicarSeedDev } from "../src/server/db/seed";
import { fecharPool } from "../src/server/db/pool";

function carregarDatabaseUrl(): string {
  const direto = process.env.DATABASE_URL?.trim();
  if (direto) return direto;
  try {
    const texto = readFileSync(join(process.cwd(), ".docker/.env"), "utf8");
    for (const linha of texto.split("\n")) {
      const m = /^DATABASE_URL=(.*)$/.exec(linha.trim());
      if (m?.[1]) return m[1].trim();
    }
  } catch {
    /* vazio */
  }
  throw new Error("Defina DATABASE_URL ou crie .docker/.env");
}

const comando = process.argv[2] ?? "all";

async function main() {
  const url = carregarDatabaseUrl();
  if (comando === "migrate" || comando === "all") {
    await aplicarMigrations(url);
    console.log("Migrations aplicadas.");
  }
  if (comando === "seed" || comando === "all") {
    await aplicarSeedDev(url);
    console.log("Seed dev aplicado.");
  }
  await fecharPool();
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});