import type { Inseminacao } from "../../../data/mock";
import {
  calcularDataDiagnosticoPrevista,
  calcularPrevisaoParto,
  calcularProximaTentativa,
  matrizComInseminacaoPendente,
  type StatusInseminacao,
} from "../../inseminacoes/domain/calculos";
import {
  dashboardDemoPayload,
  filtrarMatrizes,
  gravarEstadoDemoMock,
  obterEstadoDemoMock,
  type DemoHistoricoApi,
  type DemoMatrizApi,
  type DemoMockEstado,
} from "../domain/demo-mock-estado";

const DIAS_DIAGNOSTICO = 30;

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

async function lerCorpo(init: RequestInit): Promise<Record<string, unknown>> {
  if (!init.body || typeof init.body !== "string") {
    return {};
  }
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function novoId(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function historicoResumo(historico: DemoHistoricoApi[]) {
  return historico.map((h) => ({
    numeroTentativa: h.numeroTentativa,
    status: h.status as StatusInseminacao,
  }));
}

function nomePorId(
  itens: Array<{ id: string; nome: string }>,
  id: string,
  fallback = "—",
): string {
  return itens.find((i) => i.id === id)?.nome ?? fallback;
}

function pendenteDaMatriz(
  estado: DemoMockEstado,
  matrizId: string,
): DemoHistoricoApi | undefined {
  return (estado.historico[matrizId] ?? []).find((h) => h.status === "pendente");
}

function acharInseminacao(
  estado: DemoMockEstado,
  inseminacaoId: string,
): { matrizId: string; item: DemoHistoricoApi } | null {
  for (const [matrizId, lista] of Object.entries(estado.historico)) {
    const item = lista.find((h) => h.id === inseminacaoId);
    if (item) return { matrizId, item };
  }
  return null;
}

function criarInseminacaoNaMatriz(
  estado: DemoMockEstado,
  matrizId: string,
  body: Record<string, unknown>,
): { criada: ReturnType<typeof montarInseminacaoCriada>; historico: DemoHistoricoApi } {
  const matriz = estado.matrizes.find((m) => m.id === matrizId);
  if (!matriz || !matriz.ativa) {
    throw new Error("Matriz não encontrada.");
  }
  const historico = estado.historico[matrizId] ?? [];
  if (matrizComInseminacaoPendente(historicoResumo(historico))) {
    throw new Error("Matriz já possui inseminação pendente.");
  }
  const numeroTentativa = calcularProximaTentativa(historicoResumo(historico));
  const data = String(body.data ?? new Date().toISOString().slice(0, 10));
  const tipo = String(body.tipo ?? "IATF") as Inseminacao["tipo"];
  const inseminadorId = String(body.inseminador_id ?? "");
  const reprodutorId = String(body.reprodutor_id ?? "");
  const loteId = body.lote_id ? String(body.lote_id) : null;
  const id = novoId("demo-ia");
  const dataDiagnosticoPrevista = calcularDataDiagnosticoPrevista(data, DIAS_DIAGNOSTICO);
  const item: DemoHistoricoApi = {
    id,
    data,
    tipo,
    status: "pendente",
    numeroTentativa,
    reprodutor: nomePorId(estado.reprodutores, reprodutorId, "Netuno FIV"),
    inseminador: nomePorId(estado.inseminadores, inseminadorId, "Conta demo"),
    lote: loteId ? nomePorId(estado.lotes, loteId) : null,
    dataDiagnosticoPrevista,
    previsaoParto: null,
    observacoes: body.observacoes ? String(body.observacoes) : null,
  };
  estado.historico[matrizId] = [...historico, item];
  matriz.ultimaInseminacao = data;
  matriz.situacao = "pendente";
  if (inseminadorId) {
    estado.ultimoInseminadorId = inseminadorId;
  }
  return {
    criada: montarInseminacaoCriada(id, matrizId, numeroTentativa, dataDiagnosticoPrevista),
    historico: item,
  };
}

function montarInseminacaoCriada(
  id: string,
  matrizId: string,
  numeroTentativa: number,
  dataDiagnosticoPrevista: string,
) {
  return {
    id,
    matriz_id: matrizId,
    numero_tentativa: numeroTentativa,
    status: "pendente" as const,
    data_diagnostico_prevista: dataDiagnosticoPrevista,
  };
}

function contextoMatriz(estado: DemoMockEstado, matrizId: string) {
  const historico = estado.historico[matrizId] ?? [];
  const resumo = historicoResumo(historico);
  return {
    temPendente: matrizComInseminacaoPendente(resumo),
    proximaTentativa: calcularProximaTentativa(resumo),
    diasDiagnosticoPrevisto: DIAS_DIAGNOSTICO,
    aprendidoDaMatriz: false,
  };
}

function resumoRelatoriosDemo(estado: DemoMockEstado) {
  const ativas = estado.matrizes.filter((m) => m.ativa);
  const porSituacao = {
    prenhe: ativas.filter((m) => m.situacao === "prenhe").length,
    pendente: ativas.filter((m) => m.situacao === "pendente").length,
    vazia: ativas.filter((m) => m.situacao === "vazia").length,
    sem: ativas.filter((m) => m.situacao === "sem").length,
  };
  const diagnosticadas = porSituacao.prenhe + porSituacao.vazia;
  const taxa =
    diagnosticadas === 0 ? 0 : Math.round((porSituacao.prenhe / diagnosticadas) * 100);
  return {
    periodo: "mes_atual" as const,
    taxaPrenhezGeral: taxa,
    prenhes: porSituacao.prenhe,
    diagnosticadas,
    inseminadasMes: ativas.length - porSituacao.sem,
    pendentes: porSituacao.pendente,
    porSituacao,
    taxaPorReprodutor: estado.reprodutores.slice(0, 2).map((r) => ({
      chave: r.nome,
      taxaPercentual: taxa,
      diagnosticadas,
    })),
    taxaPorTipo: [
      { chave: "IATF", taxaPercentual: taxa, diagnosticadas },
      { chave: "CN", taxaPercentual: taxa, diagnosticadas },
    ],
    taxaPorLote: estado.lotes.slice(0, 1).map((l) => ({
      chave: l.nome,
      taxaPercentual: taxa,
      diagnosticadas,
    })),
    mediaRepeticoes: 0.4,
  };
}

/** Simula a API de dados para conta demo (sem gravar no Postgres). */
export async function responderDemoMock(
  caminho: string,
  init: RequestInit = {},
): Promise<Response> {
  const metodo = (init.method ?? "GET").toUpperCase();
  const url = new URL(caminho, "http://local");
  const partes = url.pathname.split("/").filter(Boolean);

  if (partes[0] !== "api") {
    return json({ error: "Não encontrado." }, 404);
  }

  const estado = obterEstadoDemoMock();

  if (partes[1] === "dashboard" && metodo === "GET") {
    return json(dashboardDemoPayload(estado));
  }

  if (partes[1] === "relatorios" && partes[2] === "resumo" && metodo === "GET") {
    return json(resumoRelatoriosDemo(estado));
  }

  if (partes[1] === "relatorios" && partes[2] === "inseminacoes.csv" && metodo === "GET") {
    return new Response("matriz,data,tipo,reprodutor\n", {
      status: 200,
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }

  if (partes[1] === "cadastro" && partes[2] === "membros") {
    const membroId = partes[3];
    if (partes.length === 3 && metodo === "GET") {
      return json({ membros: estado.membros });
    }
    if (partes.length === 3 && metodo === "POST") {
      const body = await lerCorpo(init);
      const novo = {
        userId: novoId("demo-user"),
        email: String(body.email ?? ""),
        nome: String(body.nome ?? ""),
        papel: (body.papel === "operador" ? "operador" : "admin") as "admin" | "operador",
        ativo: true,
      };
      estado.membros.push(novo);
      gravarEstadoDemoMock(estado);
      return json({ ok: true }, 201);
    }
    if (partes.length === 4 && membroId && metodo === "PATCH") {
      const membro = estado.membros.find((m) => m.userId === membroId);
      if (!membro) return json({ error: "Usuário não encontrado." }, 404);
      const body = await lerCorpo(init);
      if (typeof body.ativo === "boolean") membro.ativo = body.ativo;
      gravarEstadoDemoMock(estado);
      return json({ ok: true });
    }
  }

  if (partes[1] === "importacao" && partes[2] === "csv" && metodo === "POST") {
    const body = await lerCorpo(init);
    const conteudo = String(body.conteudo ?? "");
    const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim());
    let criadas = 0;
    const erros: string[] = [];
    for (let i = 1; i < linhas.length; i += 1) {
      const cols = linhas[i].split(";");
      const nome = cols[0]?.trim();
      const brinco = cols[1]?.trim() ?? "";
      if (!nome) {
        erros.push(`Linha ${i + 1}: nome obrigatório.`);
        continue;
      }
      const id = novoId("demo-m");
      estado.matrizes.push({
        id,
        nome,
        brinco,
        raca: cols[2]?.trim() || null,
        observacoes: null,
        situacao: "sem",
        ultimaInseminacao: null,
        ativa: true,
      });
      estado.historico[id] = [];
      criadas += 1;
    }
    gravarEstadoDemoMock(estado);
    return json({ criadas, ignoradas: 0, erros });
  }

  if (partes[1] === "matrizes") {
    if (partes.length === 2 && metodo === "GET") {
      const consulta = url.searchParams.get("q") ?? undefined;
      const incluirInativas = url.searchParams.get("ativas") === "false";
      const lista = filtrarMatrizes(estado, consulta, { incluirInativas });
      return json({ matrizes: lista });
    }

    if (partes.length === 2 && metodo === "POST") {
      const body = await lerCorpo(init);
      const nova: DemoMatrizApi = {
        id: novoId("demo-m"),
        nome: String(body.nome ?? ""),
        brinco: String(body.brinco ?? ""),
        raca: body.raca ? String(body.raca) : null,
        observacoes: body.observacoes ? String(body.observacoes) : null,
        situacao: "sem",
        ultimaInseminacao: null,
        ativa: true,
      };
      estado.matrizes.unshift(nova);
      estado.historico[nova.id] = [];
      gravarEstadoDemoMock(estado);
      return json({ matriz: nova }, 201);
    }

    const matrizId = partes[2];
    if (matrizId && partes.length === 4 && partes[3] === "historico" && metodo === "GET") {
      const historico = estado.historico[matrizId] ?? [];
      const repeticoes = historico.filter((h) => h.status === "vazia").length;
      return json({ historico, repeticoes });
    }

    if (matrizId && partes.length === 4 && partes[3] === "contexto-inseminacao" && metodo === "GET") {
      return json(contextoMatriz(estado, matrizId));
    }

    if (matrizId && partes.length === 4 && partes[3] === "inseminacao-pendente" && metodo === "GET") {
      const pendente = pendenteDaMatriz(estado, matrizId);
      if (!pendente) return json({ inseminacao: null });
      return json({
        inseminacao: {
          id: pendente.id,
          matriz_id: matrizId,
          data: pendente.data,
          numero_tentativa: pendente.numeroTentativa,
          tipo: pendente.tipo,
          data_diagnostico_prevista: pendente.dataDiagnosticoPrevista,
        },
      });
    }

    if (partes.length === 3 && matrizId && metodo === "GET") {
      const matriz = estado.matrizes.find((m) => m.id === matrizId);
      if (!matriz) return json({ error: "Matriz não encontrada." }, 404);
      return json({ matriz });
    }

    if (partes.length === 3 && matrizId && metodo === "PATCH") {
      const matriz = estado.matrizes.find((m) => m.id === matrizId);
      if (!matriz) return json({ error: "Matriz não encontrada." }, 404);
      const body = await lerCorpo(init);
      if (body.nome !== undefined) matriz.nome = String(body.nome);
      if (body.brinco !== undefined) matriz.brinco = String(body.brinco);
      if (body.raca !== undefined) matriz.raca = body.raca ? String(body.raca) : null;
      if (body.observacoes !== undefined) {
        matriz.observacoes = body.observacoes ? String(body.observacoes) : null;
      }
      if (body.ativa === false) matriz.ativa = false;
      if (body.ativa === true) matriz.ativa = true;
      gravarEstadoDemoMock(estado);
      return json({ matriz });
    }
  }

  if (partes[1] === "inseminacoes") {
    if (url.pathname === "/api/inseminacoes/ultimo-inseminador" && metodo === "GET") {
      return json({ inseminador_id: estado.ultimoInseminadorId });
    }

    if (url.pathname === "/api/inseminacoes/lote/preview" && metodo === "POST") {
      const body = await lerCorpo(init);
      const ids = Array.isArray(body.matriz_ids) ? body.matriz_ids.map(String) : [];
      const matrizes_com_pendencia = ids
        .filter((id) => pendenteDaMatriz(estado, id))
        .map((id) => {
          const m = estado.matrizes.find((x) => x.id === id);
          return { matriz_id: id, nome: m?.nome ?? id };
        });
      return json({ matrizes_com_pendencia });
    }

    if (url.pathname === "/api/inseminacoes/lote" && metodo === "POST") {
      const body = await lerCorpo(init);
      const ids = Array.isArray(body.matriz_ids) ? body.matriz_ids.map(String) : [];
      const criadas = [];
      const matrizes_com_pendencia = [];
      for (const matrizId of ids) {
        if (pendenteDaMatriz(estado, matrizId)) {
          const m = estado.matrizes.find((x) => x.id === matrizId);
          matrizes_com_pendencia.push({ matriz_id: matrizId, nome: m?.nome ?? matrizId });
          continue;
        }
        try {
          const { criada } = criarInseminacaoNaMatriz(estado, matrizId, body);
          criadas.push(criada);
        } catch {
          // ignora matriz inválida no lote demo
        }
      }
      gravarEstadoDemoMock(estado);
      return json({ criadas, matrizes_com_pendencia }, 201);
    }

    if (url.pathname === "/api/inseminacoes" && metodo === "POST") {
      const body = await lerCorpo(init);
      const matrizId = String(body.matriz_id ?? "");
      try {
        const { criada } = criarInseminacaoNaMatriz(estado, matrizId, body);
        gravarEstadoDemoMock(estado);
        return json({ inseminacao: criada }, 201);
      } catch {
        return json({ error: "Não foi possível salvar." }, 400);
      }
    }

    const inseminacaoId = partes[2];
    if (partes.length === 4 && partes[3] === "diagnostico" && metodo === "PATCH" && inseminacaoId) {
      const body = await lerCorpo(init);
      const achado = acharInseminacao(estado, inseminacaoId);
      if (!achado) return json({ error: "Inseminação não encontrada." }, 404);
      const resultado = body.resultado === "vazia" ? "vazia" : "prenhe";
      const dataDiagnostico = String(body.data_diagnostico ?? new Date().toISOString().slice(0, 10));
      achado.item.status = resultado;
      const matriz = estado.matrizes.find((m) => m.id === achado.matrizId);
      if (matriz) {
        matriz.situacao = resultado;
      }
      const previsao =
        resultado === "prenhe"
          ? calcularPrevisaoParto(achado.item.data)
          : null;
      achado.item.previsaoParto = previsao;
      gravarEstadoDemoMock(estado);
      return json({
        diagnostico: {
          id: inseminacaoId,
          matriz_id: achado.matrizId,
          status: resultado,
          data_diagnostico: dataDiagnostico,
          previsao_parto: previsao,
        },
      });
    }
  }

  const auxiliar = partes[1];
  if (auxiliar === "reprodutores" || auxiliar === "inseminadores" || auxiliar === "lotes") {
    const itemId = partes[2];
    const somenteAtivos = url.searchParams.get("somente_ativos") === "true";

  if (auxiliar === "reprodutores") {
      if (!itemId && metodo === "GET") {
        let lista = estado.reprodutores;
        if (somenteAtivos) lista = lista.filter((r) => r.ativo);
        return json({ reprodutores: lista });
      }
      if (!itemId && metodo === "POST") {
        const body = await lerCorpo(init);
        const rep = {
          id: novoId("demo-rep"),
          nome: String(body.nome ?? ""),
          raca: body.raca ? String(body.raca) : null,
          codigo_semen: body.codigo_semen ? String(body.codigo_semen) : null,
          ativo: true,
        };
        estado.reprodutores.push(rep);
        gravarEstadoDemoMock(estado);
        return json({ reprodutor: rep }, 201);
      }
      if (itemId && metodo === "PATCH") {
        const rep = estado.reprodutores.find((r) => r.id === itemId);
        if (!rep) return json({ error: "Não encontrado." }, 404);
        const body = await lerCorpo(init);
        if (body.nome !== undefined) rep.nome = String(body.nome);
        if (body.raca !== undefined) rep.raca = body.raca ? String(body.raca) : null;
        if (body.codigo_semen !== undefined) {
          rep.codigo_semen = body.codigo_semen ? String(body.codigo_semen) : null;
        }
        if (typeof body.ativo === "boolean") rep.ativo = body.ativo;
        gravarEstadoDemoMock(estado);
        return json({ reprodutor: rep });
      }
    }

    if (auxiliar === "inseminadores") {
      if (!itemId && metodo === "GET") {
        let lista = estado.inseminadores;
        if (somenteAtivos) lista = lista.filter((r) => r.ativo);
        return json({ inseminadores: lista });
      }
      if (!itemId && metodo === "POST") {
        const body = await lerCorpo(init);
        const ins = {
          id: novoId("demo-ins"),
          nome: String(body.nome ?? ""),
          ativo: true,
        };
        estado.inseminadores.push(ins);
        gravarEstadoDemoMock(estado);
        return json({ inseminador: ins }, 201);
      }
      if (itemId && metodo === "PATCH") {
        const ins = estado.inseminadores.find((r) => r.id === itemId);
        if (!ins) return json({ error: "Não encontrado." }, 404);
        const body = await lerCorpo(init);
        if (body.nome !== undefined) ins.nome = String(body.nome);
        if (typeof body.ativo === "boolean") ins.ativo = body.ativo;
        gravarEstadoDemoMock(estado);
        return json({ inseminador: ins });
      }
    }

    if (auxiliar === "lotes") {
      if (!itemId && metodo === "GET") {
        let lista = estado.lotes;
        if (somenteAtivos) lista = lista.filter((r) => r.ativo);
        return json({ lotes: lista });
      }
      if (!itemId && metodo === "POST") {
        const body = await lerCorpo(init);
        const lote = {
          id: novoId("demo-lote"),
          nome: String(body.nome ?? ""),
          data_inicio: String(body.data_inicio ?? new Date().toISOString().slice(0, 10)),
          observacoes: body.observacoes ? String(body.observacoes) : null,
          ativo: true,
        };
        estado.lotes.push(lote);
        gravarEstadoDemoMock(estado);
        return json({ lote }, 201);
      }
      if (itemId && metodo === "PATCH") {
        const lote = estado.lotes.find((r) => r.id === itemId);
        if (!lote) return json({ error: "Não encontrado." }, 404);
        const body = await lerCorpo(init);
        if (body.nome !== undefined) lote.nome = String(body.nome);
        if (body.data_inicio !== undefined) lote.data_inicio = String(body.data_inicio);
        if (body.observacoes !== undefined) {
          lote.observacoes = body.observacoes ? String(body.observacoes) : null;
        }
        if (typeof body.ativo === "boolean") lote.ativo = body.ativo;
        gravarEstadoDemoMock(estado);
        return json({ lote });
      }
    }
  }

  if (metodo === "GET") {
    return json({});
  }

  return json({ ok: true });
}