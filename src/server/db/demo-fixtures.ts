import { inseminadores, lotesComObs, matrizes } from "../../data/mock";

/** Dados de leitura do cadastro demo (seed Postgres). Fonte: `src/data/mock.ts`. */
export const DEMO_REPRODUTORES = [
  {
    id: "00000000-0000-4000-8100-000000000001",
    nome: "Netuno FIV",
    raca: "Nelore",
    codigo_semen: "NET-FIV-01",
  },
  {
    id: "00000000-0000-4000-8100-000000000002",
    nome: "Barão TE",
    raca: "Angus",
    codigo_semen: "BAR-TE-02",
  },
  {
    id: "00000000-0000-4000-8100-000000000003",
    nome: "Trovão",
    raca: "Brahman",
    codigo_semen: "TRO-03",
  },
  {
    id: "00000000-0000-4000-8100-000000000004",
    nome: "Imperador",
    raca: "Girolando",
    codigo_semen: "IMP-04",
  },
] as const;

const demoUuid = (bloco: "8200" | "8300" | "8400", indice: number) =>
  `00000000-0000-4000-${bloco}-${String(indice).padStart(12, "0")}`;

export const DEMO_INSEMINADORES = inseminadores.map((nome, indice) => ({
  id: demoUuid("8200", indice + 1),
  nome,
}));

const DATA_INICIO_LOTES = ["2026-06-01", "2026-07-01", "2026-08-15"] as const;

export const DEMO_LOTES = lotesComObs.map((lote, indice) => ({
  id: demoUuid("8300", indice + 1),
  nome: lote.nome,
  data_inicio: DATA_INICIO_LOTES[indice] ?? "2026-06-01",
  observacoes: lote.observacoes,
}));

export const DEMO_MATRIZES = matrizes.map((m) => ({
  id: demoUuid("8400", Number(m.id)),
  nome: m.nome,
  brinco: m.brinco,
  raca: m.raca ?? null,
  observacoes: m.observacoes ?? null,
}));