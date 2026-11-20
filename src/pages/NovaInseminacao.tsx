import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Search, TriangleAlert } from "lucide-react";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  Cartao,
  SelecaoSheet,
  cx,
  inputClass,
  textareaClass,
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
  contextoMatrizInseminacaoApi,
  criarInseminacaoApi,
  ultimoInseminadorIdApi,
} from "../features/inseminacoes/infrastructure/inseminacoes-api";
import {
  type MatrizLista,
  listarMatrizesApi,
} from "../features/matrizes/infrastructure/matrizes-api";
import { textoBuscaCoincide } from "../features/matrizes/domain/busca";

const tipos = ["CN", "IATF", "Protocolo"] as const;

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function NovaInseminacao() {
  const navigate = useNavigate();
  const location = useLocation();
  const matrizIdInicial =
    (location.state as { matrizId?: string } | null)?.matrizId ?? null;
  const [tipo, setTipo] = useState<(typeof tipos)[number]>("IATF");
  const [buscaMatriz, setBuscaMatriz] = useState("");
  const [matrizId, setMatrizId] = useState<string | null>(null);
  const [matrizNome, setMatrizNome] = useState("");
  const [aberto, setAberto] = useState(false);
  const [data, setData] = useState(hojeISO());
  const [reprodutorId, setReprodutorId] = useState("");
  const [inseminadorId, setInseminadorId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [reprodutores, setReprodutores] = useState<Reprodutor[]>([]);
  const [inseminadores, setInseminadores] = useState<Inseminador[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [matrizes, setMatrizes] = useState<MatrizLista[]>([]);
  const [temPendente, setTemPendente] = useState(false);
  const [proximaTentativa, setProximaTentativa] = useState<number | null>(null);
  const [diasDiagnostico, setDiasDiagnostico] = useState<number | null>(null);
  const [previsaoAprendida, setPrevisaoAprendida] = useState(false);
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
        setReprodutores(r.length ? r : []);
        setInseminadores(i.length ? i : []);
        setLotes(l);
        setMatrizes(m);
        if (matrizIdInicial) {
          const alvo = m.find((x) => x.id === matrizIdInicial);
          if (alvo) {
            setMatrizId(alvo.id);
            setMatrizNome(alvo.nome);
            setBuscaMatriz(alvo.nome);
          }
        }
        if (r[0]) setReprodutorId((atual) => atual || r[0].id);
        const ultimo = await ultimoInseminadorIdApi();
        if (ultimo) {
          setInseminadorId(ultimo);
        } else if (i[0]) {
          setInseminadorId((atual) => atual || i[0].id);
        }
      } catch {
        setErro("Não foi possível carregar os cadastros.");
      }
    })();
  }, [matrizIdInicial]);

  useEffect(() => {
    if (!matrizId) {
      setTemPendente(false);
      setProximaTentativa(null);
      setDiasDiagnostico(null);
      setPrevisaoAprendida(false);
      return;
    }
    void (async () => {
      try {
        const ctx = await contextoMatrizInseminacaoApi(matrizId);
        setTemPendente(ctx.temPendente);
        setProximaTentativa(ctx.proximaTentativa);
        setDiasDiagnostico(ctx.diasDiagnosticoPrevisto);
        setPrevisaoAprendida(ctx.aprendidoDaMatriz);
      } catch {
        setTemPendente(false);
        setProximaTentativa(null);
        setDiasDiagnostico(null);
        setPrevisaoAprendida(false);
      }
    })();
  }, [matrizId]);

  const encontradas = useMemo(() => {
    const q = buscaMatriz.trim();
    if (!q) return matrizes.slice(0, 12);
    return matrizes.filter(
      (m) =>
        textoBuscaCoincide(m.nome, q) ||
        (m.brinco && textoBuscaCoincide(m.brinco, q)),
    );
  }, [matrizes, buscaMatriz]);

  function escolherMatriz(matriz: MatrizLista) {
    setMatrizId(matriz.id);
    setMatrizNome(matriz.nome);
    setBuscaMatriz(matriz.nome);
    setAberto(false);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (!matrizId) {
      setErro("Selecione a matriz.");
      return;
    }
    if (!reprodutorId || !inseminadorId) {
      setErro("Preencha reprodutor e inseminador.");
      return;
    }
    setSalvando(true);
    try {
      await criarInseminacaoApi({
        matriz_id: matrizId,
        reprodutor_id: reprodutorId,
        inseminador_id: inseminadorId,
        lote_id: loteId || null,
        data,
        tipo,
        observacoes: observacoes.trim() || undefined,
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

  const rotuloMatriz = matrizNome || buscaMatriz;

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo="Nova inseminação" voltar="/inicio" />
      <form onSubmit={salvar}>
        <div className="px-4 pb-32 pt-4">
          <Cartao className="space-y-5 p-4">
            <div className="relative">
              <Campo
                rotulo="Matriz"
                icone={<Search className="size-5" strokeWidth={1.75} />}
              >
                <input
                  value={rotuloMatriz}
                  placeholder="Buscar por nome ou brinco"
                  onFocus={() => setAberto(true)}
                  onBlur={() => setTimeout(() => setAberto(false), 150)}
                  onChange={(e) => {
                    setBuscaMatriz(e.target.value);
                    setMatrizNome(e.target.value);
                    setMatrizId(null);
                    setAberto(true);
                  }}
                  className={inputClass}
                />
              </Campo>
              {aberto && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover py-1 shadow-(--shadow-card)">
                  {encontradas.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onMouseDown={() => escolherMatriz(m)}
                        className="flex min-h-12 w-full items-center justify-between px-4 text-left hover:bg-accent"
                      >
                        <span className="font-medium">{m.nome}</span>
                        {m.brinco && (
                          <span className="text-sm text-muted-foreground">
                            #{m.brinco}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                  {encontradas.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      Nenhuma matriz encontrada
                    </li>
                  )}
                </ul>
              )}
            </div>
            {temPendente && (
              <div className="flex items-start gap-2.5 rounded-md bg-warning-soft p-3 text-sm text-foreground">
                <TriangleAlert
                  className="mt-0.5 size-5 shrink-0 text-status-pendente"
                  strokeWidth={1.75}
                />
                Esta matriz já tem inseminação pendente. Você ainda pode salvar
                uma nova tentativa se for o caso.
              </div>
            )}
            {proximaTentativa != null && (
              <p className="text-sm text-muted-foreground">
                Será registrada como tentativa{" "}
                <span className="font-semibold text-foreground">
                  {proximaTentativa}
                </span>
                .
              </p>
            )}
            {diasDiagnostico != null && matrizId && (
              <p className="text-sm text-muted-foreground">
                Previsão de diagnóstico em{" "}
                <span className="font-semibold text-foreground">
                  {diasDiagnostico} dias
                </span>
                {previsaoAprendida
                  ? " (média dos diagnósticos anteriores desta matriz)."
                  : " (padrão de 30 dias até haver histórico)."}
              </p>
            )}
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
            <label className="block">
              <span className="mb-1.5 flex gap-1 text-sm font-semibold">
                Observações{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: cio forte pela manhã"
                className={textareaClass}
              />
            </label>
            {erro && (
              <p className="text-sm font-medium text-status-vazia">{erro}</p>
            )}
          </Cartao>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-border bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Botao type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar inseminação"}
          </Botao>
          <Link
            to="/inseminacao-lote"
            className="mt-2 block text-center text-sm font-medium text-brand"
          >
            Lançamento em lote
          </Link>
        </div>
      </form>
    </AppShell>
  );
}