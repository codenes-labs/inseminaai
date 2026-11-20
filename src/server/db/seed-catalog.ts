import {
  historicoPorMatriz,
  inseminadores,
  lotesComObs,
  matrizes,
} from "../../data/mock";
import {
  calcularDataDiagnosticoPrevista,
  calcularPrevisaoParto,
} from "../../features/inseminacoes/domain/calculos";

/**
 * Só para `scripts/generate-admin-seed-sql.ts` regenerar o SQL.
 * Em runtime o seed executa `.docker/db/seeds/admin_dev_catalog.sql`.
 */
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

const demoUuid = (
  bloco: "8200" | "8300" | "8400" | "8500",
  indice: number,
) => `00000000-0000-4000-${bloco}-${String(indice).padStart(12, "0")}`;

function dataBrParaIso(br: string): string {
  const [d, m, y] = br.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function mapTipo(tipo: "CN" | "IATF" | "Protocolo"): "CN" | "IATF" | "PROTOCOLO" {
  if (tipo === "Protocolo") return "PROTOCOLO";
  return tipo;
}

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

const reprodutorIdPorNome = Object.fromEntries(
  DEMO_REPRODUTORES.map((r) => [r.nome, r.id]),
);
const inseminadorIdPorNome = Object.fromEntries(
  DEMO_INSEMINADORES.map((i) => [i.nome, i.id]),
);
const loteIdPorNome = Object.fromEntries(DEMO_LOTES.map((l) => [l.nome, l.id]));
const matrizUuidPorMockId = Object.fromEntries(
  matrizes.map((m) => [m.id, demoUuid("8400", Number(m.id))]),
);

export type DemoInseminacaoSeed = {
  id: string;
  matriz_id: string;
  reprodutor_id: string;
  inseminador_id: string;
  lote_id: string | null;
  data: string;
  tipo: "CN" | "IATF" | "PROTOCOLO";
  numero_tentativa: number;
  status: "pendente" | "prenhe" | "vazia";
  data_diagnostico_prevista: string | null;
  previsao_parto: string | null;
  observacoes: string | null;
};

let sequenciaIa = 0;
function proximaIaId(): string {
  sequenciaIa += 1;
  return demoUuid("8500", sequenciaIa);
}

function resolverPrevisaoParto(
  dataIso: string,
  status: "pendente" | "prenhe" | "vazia",
  previstoMock?: string,
): string | null {
  if (status !== "prenhe") return null;
  if (previstoMock?.includes("/")) return dataBrParaIso(previstoMock);
  return calcularPrevisaoParto(dataIso);
}

function resolverDiagnosticoPrevisto(
  dataIso: string,
  status: "pendente" | "prenhe" | "vazia",
  previstoMock?: string,
): string | null {
  if (status !== "pendente") return null;
  if (previstoMock?.includes("/")) return dataBrParaIso(previstoMock);
  return calcularDataDiagnosticoPrevista(dataIso);
}

export const DEMO_INSEMINACOES: DemoInseminacaoSeed[] = [];

for (const matriz of matrizes) {
  const matrizId = matrizUuidPorMockId[matriz.id];
  const historico = historicoPorMatriz[matriz.id];

  if (historico?.length) {
    for (const ia of historico) {
      const data = dataBrParaIso(ia.data);
      DEMO_INSEMINACOES.push({
        id: proximaIaId(),
        matriz_id: matrizId,
        reprodutor_id: reprodutorIdPorNome[ia.reprodutor],
        inseminador_id: inseminadorIdPorNome[ia.inseminador],
        lote_id: ia.lote ? (loteIdPorNome[ia.lote] ?? null) : null,
        data,
        tipo: mapTipo(ia.tipo),
        numero_tentativa: ia.numeroTentativa,
        status: ia.status,
        data_diagnostico_prevista: resolverDiagnosticoPrevisto(
          data,
          ia.status,
          ia.dataDiagnosticoPrevista,
        ),
        previsao_parto: resolverPrevisaoParto(data, ia.status, ia.previsaoParto),
        observacoes: null,
      });
    }
    continue;
  }

  if (!matriz.ultimaInseminacao || matriz.situacao === "sem") continue;

  const data = dataBrParaIso(matriz.ultimaInseminacao);
  const status = matriz.situacao;

  DEMO_INSEMINACOES.push({
    id: proximaIaId(),
    matriz_id: matrizId,
    reprodutor_id: reprodutorIdPorNome["Netuno FIV"],
    inseminador_id: inseminadorIdPorNome["Vitor Almeida"],
    lote_id: null,
    data,
    tipo: "IATF",
    numero_tentativa: 1,
    status,
    data_diagnostico_prevista: resolverDiagnosticoPrevisto(data, status),
    previsao_parto: resolverPrevisaoParto(data, status),
    observacoes: null,
  });
}