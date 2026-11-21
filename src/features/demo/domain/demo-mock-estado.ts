import {
  historicoDaMatriz,
  historicoPorMatriz,
  inseminadores,
  lotesComObs,
  matrizes,
  proximosPartos,
  reprodutores,
  resumo,
  ultimasInseminacoes,
  type Inseminacao,
  type Matriz,
  type Situacao,
} from "../../../data/mock";
import { textoBuscaCoincide } from "../../matrizes/domain/busca";

export const DEMO_MOCK_STORAGE_KEY = "inseminaai.demo.mock";

export type DemoMatrizApi = {
  id: string;
  nome: string;
  brinco: string;
  raca: string | null;
  observacoes: string | null;
  situacao: Situacao;
  ultimaInseminacao: string | null;
  ativa: boolean;
};

export type DemoHistoricoApi = {
  id: string;
  data: string;
  tipo: Inseminacao["tipo"];
  status: Situacao;
  numeroTentativa: number;
  reprodutor: string;
  inseminador: string;
  lote: string | null;
  dataDiagnosticoPrevista: string | null;
  previsaoParto: string | null;
  observacoes: string | null;
};

export type DemoMembroApi = {
  userId: string;
  email: string;
  nome: string;
  papel: "admin" | "operador";
  ativo: boolean;
};

export type DemoMockEstado = {
  matrizes: DemoMatrizApi[];
  historico: Record<string, DemoHistoricoApi[]>;
  reprodutores: Array<{
    id: string;
    nome: string;
    raca: string | null;
    codigo_semen: string | null;
    ativo: boolean;
  }>;
  inseminadores: Array<{ id: string; nome: string; ativo: boolean }>;
  lotes: Array<{
    id: string;
    nome: string;
    data_inicio: string;
    observacoes: string | null;
    ativo: boolean;
  }>;
  membros: DemoMembroApi[];
  ultimoInseminadorId: string | null;
};

function matrizParaApi(m: Matriz): DemoMatrizApi {
  return {
    id: m.id,
    nome: m.nome,
    brinco: m.brinco,
    raca: m.raca ?? null,
    observacoes: m.observacoes ?? null,
    situacao: m.situacao,
    ultimaInseminacao: m.ultimaInseminacao,
    ativa: true,
  };
}

function historicoParaApi(lista: Inseminacao[]): DemoHistoricoApi[] {
  return lista.map((ia) => ({
    id: ia.id,
    data: ia.data,
    tipo: ia.tipo,
    status:
      ia.status === "pendente" || ia.status === "prenhe" || ia.status === "vazia"
        ? ia.status
        : "pendente",
    numeroTentativa: ia.numeroTentativa,
    reprodutor: ia.reprodutor,
    inseminador: ia.inseminador,
    lote: ia.lote ?? null,
    dataDiagnosticoPrevista: ia.dataDiagnosticoPrevista ?? null,
    previsaoParto: ia.previsaoParto ?? null,
    observacoes: ia.observacoes ?? null,
  }));
}

export function criarEstadoDemoInicial(): DemoMockEstado {
  const historico: Record<string, DemoHistoricoApi[]> = {};
  for (const m of matrizes) {
    const fonte = historicoPorMatriz[m.id] ?? historicoDaMatriz(m.id);
    historico[m.id] = historicoParaApi(fonte);
  }
  return {
    matrizes: matrizes.map(matrizParaApi),
    historico,
    reprodutores: reprodutores.map((nome, i) => ({
      id: `demo-rep-${i + 1}`,
      nome,
      raca: null,
      codigo_semen: null,
      ativo: true,
    })),
    inseminadores: inseminadores.map((nome, i) => ({
      id: `demo-ins-${i + 1}`,
      nome,
      ativo: true,
    })),
    lotes: lotesComObs.map((lote, i) => ({
      id: `demo-lote-${i + 1}`,
      nome: lote.nome,
      data_inicio: "2026-10-01",
      observacoes: lote.observacoes,
      ativo: true,
    })),
    membros: [
      {
        userId: "demo-membro-1",
        email: "teste@teste.com",
        nome: "Conta demo",
        papel: "admin",
        ativo: true,
      },
    ],
    ultimoInseminadorId: "demo-ins-1",
  };
}

export function lerEstadoDemoMock(): DemoMockEstado | null {
  try {
    const raw = sessionStorage.getItem(DEMO_MOCK_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoMockEstado;
  } catch {
    return null;
  }
}

export function gravarEstadoDemoMock(estado: DemoMockEstado) {
  sessionStorage.setItem(DEMO_MOCK_STORAGE_KEY, JSON.stringify(estado));
}

export function reiniciarEstadoDemoMock() {
  gravarEstadoDemoMock(criarEstadoDemoInicial());
}

export function limparEstadoDemoMock() {
  sessionStorage.removeItem(DEMO_MOCK_STORAGE_KEY);
}

export function obterEstadoDemoMock(): DemoMockEstado {
  const atual = lerEstadoDemoMock();
  if (atual?.membros && atual.matrizes?.length) {
    return atual;
  }
  const inicial = criarEstadoDemoInicial();
  gravarEstadoDemoMock(inicial);
  return inicial;
}

export function filtrarMatrizes(
  estado: DemoMockEstado,
  consulta?: string,
  opcoes?: { incluirInativas?: boolean },
): DemoMatrizApi[] {
  const q = consulta?.trim();
  let lista = estado.matrizes;
  if (!opcoes?.incluirInativas) {
    lista = lista.filter((m) => m.ativa);
  }
  if (!q) return lista;
  return lista.filter(
    (m) => textoBuscaCoincide(m.nome, q) || textoBuscaCoincide(m.brinco, q),
  );
}

export function dashboardDemoPayload(estado: DemoMockEstado) {
  const ativas = estado.matrizes.filter((m) => m.ativa);
  return {
    inseminadasMes: resumo.inseminadasMes,
    aguardando: ativas.filter((m) => m.situacao === "pendente").length,
    prenhes: ativas.filter((m) => m.situacao === "prenhe").length,
    vazias: ativas.filter((m) => m.situacao === "vazia").length,
    diagnosticosVencendo7Dias: 2,
    diagnosticosProximos7Dias: ativas
      .filter((m) => m.situacao === "pendente")
      .slice(0, 3)
      .map((m) => ({
        matrizId: m.id,
        nome: m.nome,
        brinco: m.brinco,
        dataBr: m.ultimaInseminacao ?? "—",
        dias: 5,
      })),
    proximosPartos: proximosPartos.map((p) => {
      const matriz = ativas.find((m) => m.brinco === p.brinco);
      return {
        matrizId: matriz?.id ?? p.brinco,
        nome: p.nome,
        brinco: p.brinco,
        dataBr: p.data,
        dias: p.dias,
      };
    }),
    ultimasInseminacoes: ultimasInseminacoes.map((u) => {
      const matriz = ativas.find((m) => m.brinco === u.brinco);
      return {
        matrizId: matriz?.id ?? u.brinco,
        nome: u.nome,
        brinco: u.brinco,
        dataBr: u.data,
        tipo: u.tipo,
        reprodutor: u.reprodutor,
      };
    }),
  };
}