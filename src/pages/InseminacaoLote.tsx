import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Search, TriangleAlert } from "lucide-react";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  Cartao,
  Etiqueta,
  SelecaoSheet,
  cx,
  inputClass,
} from "../components/ui";
import {
  type Inseminador,
  type Lote,
  type Reprodutor,
  listarInseminadoresApi,
  listarLotesApi,
  listarReprodutoresApi,
} from "../features/cadastros-auxiliares/infrastructure/cadastros-auxiliares-api";
import {
  criarInseminacoesLoteApi,
  previewLotePendenciasApi,
  ultimoInseminadorIdApi,
} from "../features/inseminacoes/infrastructure/inseminacoes-api";
import { listarMatrizesApi } from "../features/matrizes/infrastructure/matrizes-api";
import { textoBuscaCoincide } from "../features/matrizes/domain/busca";

const tipos = ["CN", "IATF", "Protocolo"] as const;

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function InseminacaoLote() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<(typeof tipos)[number]>("IATF");
  const [data, setData] = useState(hojeISO());
  const [reprodutorId, setReprodutorId] = useState("");
  const [inseminadorId, setInseminadorId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [reprodutores, setReprodutores] = useState<Reprodutor[]>([]);
  const [inseminadores, setInseminadores] = useState<Inseminador[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [matrizes, setMatrizes] = useState<Awaited<ReturnType<typeof listarMatrizesApi>>>([]);
  const [pendentes, setPendentes] = useState<{ matriz_id: string; nome: string }[]>([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [r, i, l, m] = await Promise.all([
          listarReprodutoresApi(true),
          listarInseminadoresApi(true),
          listarLotesApi(true),
          listarMatrizesApi(),
        ]);
        setReprodutores(r);
        setInseminadores(i);
        setLotes(l);
        setMatrizes(m);
        if (r[0]) setReprodutorId((atual) => atual || r[0].id);
        const ultimo = await ultimoInseminadorIdApi();
        if (ultimo) setInseminadorId(ultimo);
        else if (i[0]) setInseminadorId((atual) => atual || i[0].id);
      } catch {
        setErro("Não foi possível carregar os cadastros.");
      }
    })();
  }, []);

  const idsSelecionadas = useMemo(() => [...selecionadas], [selecionadas]);

  useEffect(() => {
    if (idsSelecionadas.length === 0) {
      setPendentes([]);
      return;
    }
    const t = window.setTimeout(() => {
      void previewLotePendenciasApi(idsSelecionadas)
        .then(setPendentes)
        .catch(() => setPendentes([]));
    }, 300);
    return () => window.clearTimeout(t);
  }, [idsSelecionadas]);

  const filtradas = useMemo(() => {
    const q = busca.trim();
    if (!q) return matrizes;
    return matrizes.filter(
      (m) =>
        textoBuscaCoincide(m.nome, q) ||
        (m.brinco && textoBuscaCoincide(m.brinco, q)),
    );
  }, [matrizes, busca]);

  function alternar(matrizId: string) {
    setSelecionadas((prev) => {
      const prox = new Set(prev);
      if (prox.has(matrizId)) prox.delete(matrizId);
      else prox.add(matrizId);
      return prox;
    });
  }

  function marcarTodasVisiveis() {
    setSelecionadas((prev) => {
      const prox = new Set(prev);
      for (const m of filtradas) prox.add(m.id);
      return prox;
    });
  }

  function limparSelecao() {
    setSelecionadas(new Set());
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (idsSelecionadas.length === 0) {
      setErro("Marque ao menos uma matriz.");
      return;
    }
    if (!reprodutorId || !inseminadorId) {
      setErro("Preencha reprodutor e inseminador.");
      return;
    }
    setSalvando(true);
    try {
      await criarInseminacoesLoteApi({
        matriz_ids: idsSelecionadas,
        reprodutor_id: reprodutorId,
        inseminador_id: inseminadorId,
        lote_id: loteId || null,
        data,
        tipo,
      });
      navigate("/inicio");
    } catch (cause) {
      setErro(
        cause instanceof Error ? cause.message : "Não foi possível salvar.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo="Lançamento em lote" voltar="/inicio" />
      <form className="space-y-4 px-4 py-4 pb-32" onSubmit={salvar}>
        <Cartao className="space-y-5 p-4">
          <p className="text-sm text-muted-foreground">
            Mesma data, tipo e reprodutor para todas as matrizes marcadas.
          </p>
          <Campo rotulo="Data" icone={<Calendar className="size-5" strokeWidth={1.75} />}>
            <input
              type="date"
              value={data}
              max={hojeISO()}
              onChange={(e) => setData(e.target.value)}
              className={inputClass}
            />
          </Campo>
          <div>
            <span className="mb-1.5 block text-sm font-semibold">Tipo</span>
            <div className="grid grid-cols-3 gap-2">
              {tipos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={cx(
                    "press min-h-14 rounded-md border text-base font-semibold",
                    tipo === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <SelecaoSheet
            rotulo="Reprodutor"
            valor={reprodutorId}
            onChange={setReprodutorId}
            comBusca
            placeholderBusca="Buscar reprodutor"
            rotuloVazio="Selecione o reprodutor"
            valorVazio=""
            opcoes={reprodutores.map((r) => ({ id: r.id, rotulo: r.nome }))}
          />
          <SelecaoSheet
            rotulo="Inseminador"
            valor={inseminadorId}
            onChange={setInseminadorId}
            comBusca
            placeholderBusca="Buscar inseminador"
            rotuloVazio="Selecione o inseminador"
            valorVazio=""
            opcoes={inseminadores.map((i) => ({ id: i.id, rotulo: i.nome }))}
          />
          <SelecaoSheet
            rotulo="Lote"
            opcional
            valor={loteId}
            onChange={setLoteId}
            comBusca
            placeholderBusca="Buscar lote"
            rotuloVazio="Sem lote"
            valorVazio=""
            valorLimpar=""
            rotuloLimpar="Sem lote"
            opcoes={lotes.map((l) => ({ id: l.id, rotulo: l.nome }))}
          />
        </Cartao>

        <Cartao className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Matrizes</h2>
            <span className="text-sm text-muted-foreground">
              {selecionadas.size} selecionada{selecionadas.size === 1 ? "" : "s"}
            </span>
          </div>
          <Campo rotulo="Buscar" icone={<Search className="size-5" strokeWidth={1.75} />}>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome ou brinco"
              className={inputClass}
            />
          </Campo>
          <div className="flex gap-2">
            <button
              type="button"
              className="press flex-1 rounded-md bg-brand-soft py-2.5 text-sm font-semibold text-primary"
              onClick={marcarTodasVisiveis}
            >
              Marcar visíveis
            </button>
            <button
              type="button"
              className="press flex-1 rounded-md border border-border py-2.5 text-sm font-semibold"
              onClick={limparSelecao}
            >
              Limpar
            </button>
          </div>
          <ul className="max-h-[40vh] space-y-2 overflow-y-auto">
            {filtradas.map((m) => {
              const marcada = selecionadas.has(m.id);
              return (
                <li key={m.id}>
                  <label
                    className={cx(
                      "press flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3",
                      marcada ? "border-primary bg-brand-soft/40" : "border-border",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-5 shrink-0 accent-primary"
                      checked={marcada}
                      onChange={() => alternar(m.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{m.nome}</p>
                      {m.brinco ? (
                        <p className="text-xs text-muted-foreground">#{m.brinco}</p>
                      ) : null}
                    </div>
                    <Etiqueta situacao={m.situacao} />
                  </label>
                </li>
              );
            })}
          </ul>
        </Cartao>

        {pendentes.length > 0 ? (
          <div className="flex items-start gap-2.5 rounded-md bg-warning-soft p-4 text-sm text-foreground">
            <TriangleAlert
              className="mt-0.5 size-5 shrink-0 text-status-pendente"
              strokeWidth={1.75}
            />
            <p>
              {pendentes.length === 1
                ? "1 matriz marcada já tem inseminação pendente: "
                : `${pendentes.length} matrizes marcadas já têm inseminação pendente: `}
              <span className="font-medium">
                {pendentes.map((p) => p.nome).join(", ")}
              </span>
              . Você ainda pode salvar novas tentativas.
            </p>
          </div>
        ) : null}

        {erro ? (
          <p className="text-sm font-medium text-status-vazia">{erro}</p>
        ) : null}

        <Botao type="submit" disabled={salvando || selecionadas.size === 0}>
          {salvando
            ? "Salvando…"
            : selecionadas.size === 0
              ? "Salvar inseminações"
              : `Salvar ${selecionadas.size} inseminação${
                  selecionadas.size === 1 ? "" : "ões"
                }`}
        </Botao>
        <Link
          to="/nova-inseminacao"
          className="block text-center text-sm font-medium text-brand"
        >
          Registrar uma matriz só
        </Link>
      </form>
    </AppShell>
  );
}