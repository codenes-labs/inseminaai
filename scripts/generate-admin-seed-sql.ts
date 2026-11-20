/**
 * Gera `.docker/db/seeds/admin_dev_catalog.sql` a partir do catálogo TS.
 * Uso pontual ao atualizar o catálogo: `npx tsx scripts/generate-admin-seed-sql.ts`
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CADASTRO_ADMIN_ID } from "../src/server/auth/account-seed";
import {
  DEMO_INSEMINACOES,
  DEMO_INSEMINADORES,
  DEMO_LOTES,
  DEMO_MATRIZES,
  DEMO_REPRODUTORES,
} from "../src/server/db/seed-catalog";

const c = CADASTRO_ADMIN_ID;

function esc(s: string | null): string {
  if (s === null) return "null";
  return `'${s.replace(/'/g, "''")}'`;
}

const linhas: string[] = [
  "-- Catálogo dev do administrador (dados no Postgres; não usar mock na UI)",
  `DELETE FROM public.inseminacoes WHERE cadastro_id = '${c}';`,
  `DELETE FROM public.matrizes WHERE cadastro_id = '${c}';`,
  `DELETE FROM public.lotes WHERE cadastro_id = '${c}';`,
  `DELETE FROM public.inseminadores WHERE cadastro_id = '${c}';`,
  `DELETE FROM public.reprodutores WHERE cadastro_id = '${c}';`,
  "",
];

for (const r of DEMO_REPRODUTORES) {
  linhas.push(
    `INSERT INTO public.reprodutores (id, cadastro_id, nome, raca, codigo_semen, ativo) VALUES ('${r.id}', '${c}', ${esc(r.nome)}, ${esc(r.raca)}, ${esc(r.codigo_semen)}, true) ON CONFLICT (id) DO UPDATE SET cadastro_id = excluded.cadastro_id, nome = excluded.nome, raca = excluded.raca, codigo_semen = excluded.codigo_semen, ativo = true;`,
  );
}
for (const i of DEMO_INSEMINADORES) {
  linhas.push(
    `INSERT INTO public.inseminadores (id, cadastro_id, nome, ativo) VALUES ('${i.id}', '${c}', ${esc(i.nome)}, true) ON CONFLICT (id) DO UPDATE SET cadastro_id = excluded.cadastro_id, nome = excluded.nome, ativo = true;`,
  );
}
for (const l of DEMO_LOTES) {
  linhas.push(
    `INSERT INTO public.lotes (id, cadastro_id, nome, data_inicio, observacoes, ativo) VALUES ('${l.id}', '${c}', ${esc(l.nome)}, '${l.data_inicio}', ${esc(l.observacoes)}, true) ON CONFLICT (id) DO UPDATE SET cadastro_id = excluded.cadastro_id, nome = excluded.nome, data_inicio = excluded.data_inicio, observacoes = excluded.observacoes, ativo = true;`,
  );
}
for (const m of DEMO_MATRIZES) {
  linhas.push(
    `INSERT INTO public.matrizes (id, cadastro_id, nome, brinco, raca, observacoes, ativa) VALUES ('${m.id}', '${c}', ${esc(m.nome)}, ${esc(m.brinco)}, ${esc(m.raca)}, ${esc(m.observacoes)}, true) ON CONFLICT (id) DO UPDATE SET cadastro_id = excluded.cadastro_id, nome = excluded.nome, brinco = excluded.brinco, raca = excluded.raca, observacoes = excluded.observacoes, ativa = true;`,
  );
}
for (const ia of DEMO_INSEMINACOES) {
  const lote = ia.lote_id ? `'${ia.lote_id}'` : "null";
  const diag = ia.data_diagnostico_prevista
    ? `'${ia.data_diagnostico_prevista}'`
    : "null";
  const parto = ia.previsao_parto ? `'${ia.previsao_parto}'` : "null";
  linhas.push(
    `INSERT INTO public.inseminacoes (id, cadastro_id, matriz_id, reprodutor_id, inseminador_id, lote_id, data, tipo, numero_tentativa, status, data_diagnostico_prevista, previsao_parto, observacoes) VALUES ('${ia.id}', '${c}', '${ia.matriz_id}', '${ia.reprodutor_id}', '${ia.inseminador_id}', ${lote}, '${ia.data}', '${ia.tipo}', ${ia.numero_tentativa}, '${ia.status}', ${diag}, ${parto}, null) ON CONFLICT (id) DO UPDATE SET cadastro_id = excluded.cadastro_id, matriz_id = excluded.matriz_id, reprodutor_id = excluded.reprodutor_id, inseminador_id = excluded.inseminador_id, lote_id = excluded.lote_id, data = excluded.data, tipo = excluded.tipo, numero_tentativa = excluded.numero_tentativa, status = excluded.status, data_diagnostico_prevista = excluded.data_diagnostico_prevista, previsao_parto = excluded.previsao_parto;`,
  );
}

const destino = join(process.cwd(), ".docker/db/seeds/admin_dev_catalog.sql");
writeFileSync(destino, `${linhas.join("\n")}\n`, "utf8");
console.log(`Escrito ${linhas.length} linhas em ${destino}`);