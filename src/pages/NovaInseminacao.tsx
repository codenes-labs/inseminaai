import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, Search, TriangleAlert } from "lucide-react";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  Cartao,
  cx,
  inputClass,
} from "../components/ui";
import {
  inseminadores as inseminadoresMock,
  lotes as lotesMock,
  reprodutores as reprodutoresMock,
} from "../data/mock";
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

function SelectField({
  opcoes,
  valorId,
  placeholder,
  onChange,
}: {
  opcoes: { id: string; nome: string }[];
  valorId?: string;
  placeholder?: string;
  onChange?: (id: string) => void;
}) {
  return (
    <>
      <select
        value={valorId ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-12 w-full appearance-none bg-transparent text-base outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((op) => (
          <option key={op.id} value={op.id}>
            {op.nome}
          </option>
        ))}
      </select>
      <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
    </>
  );
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
        setReprodutores(
          reprodutoresMock.map((nome, idx) => ({
            id: `mock-r-${idx}`,
            nome,
            raca: null,
            codigo_semen: null,
            ativo: true,
          })),
        );
        setInseminadores(
          inseminadoresMock.map((nome, idx) => ({
            id: `mock-i-${idx}`,
            nome,
            ativo: true,
          })),
        );
        setLotes(
          lotesMock.map((nome, idx) => ({
            id: `mock-l-${idx}`,
            nome,
            data_inicio: hojeISO(),
            observacoes: null,
            ativo: true,
          })),
        );
      }
    })();
  }, [matrizIdInicial]);

  useEffect(() => {
    if (!matrizId) {
      setTemPendente(false);
      setProximaTentativa(null);
      return;
    }
    void (async () => {
      try {
        const ctx = await contextoMatrizInseminacaoApi(matrizId);
        setTemPendente(ctx.temPendente);
        setProximaTentativa(ctx.proximaTentativa);
      } catch {
        setTemPendente(false);
        setProximaTentativa(null);
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
            <Campo rotulo="Reprodutor">
              <SelectField
                opcoes={reprodutores}
                valorId={reprodutorId}
                placeholder="Selecione o reprodutor"
                onChange={setReprodutorId}
              />
            </Campo>
            <Campo rotulo="Inseminador">
              <SelectField
                opcoes={inseminadores}
                valorId={inseminadorId}
                onChange={setInseminadorId}
              />
            </Campo>
            <Campo rotulo="Lote" opcional>
              <SelectField
                opcoes={lotes}
                valorId={loteId}
                placeholder="Sem lote"
                onChange={setLoteId}
              />
            </Campo>
            <label className="block">
              <span className="mb-1.5 flex gap-1 text-sm font-semibold">
                Observações{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </span>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: cio forte pela manhã"
                className="w-full rounded-md border border-input bg-card p-3.5 text-base outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
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
        </div>
      </form>
    </AppShell>
  );
}