import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  Cartao,
  Vazio,
  cx,
  inputClass,
  textareaClass,
} from "../components/ui";
import {
  inseminacaoPendenteDaMatrizApi,
  registrarDiagnosticoApi,
  type InseminacaoPendente,
} from "../features/inseminacoes/infrastructure/inseminacoes-api";
import {
  type MatrizLista,
  obterMatrizApi,
} from "../features/matrizes/infrastructure/matrizes-api";

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

function formatarDataBr(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function Diagnostico() {
  const { id: matrizId } = useParams();
  const navigate = useNavigate();
  const [matriz, setMatriz] = useState<MatrizLista | null | undefined>(
    undefined,
  );
  const [pendente, setPendente] = useState<InseminacaoPendente | null | undefined>(
    undefined,
  );
  const [resultado, setResultado] = useState<"prenhe" | "vazia">("prenhe");
  const [dataDiagnostico, setDataDiagnostico] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!matrizId) return;
    let ativo = true;
    void (async () => {
      try {
        const [m, p] = await Promise.all([
          obterMatrizApi(matrizId),
          inseminacaoPendenteDaMatrizApi(matrizId),
        ]);
        if (ativo) {
          setMatriz(m);
          setPendente(p);
        }
      } catch {
        if (ativo) {
          setMatriz(null);
          setPendente(null);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [matrizId]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!pendente || !matrizId) return;
    setErro("");
    setSalvando(true);
    try {
      await registrarDiagnosticoApi(pendente.id, {
        resultado,
        data_diagnostico: dataDiagnostico,
        observacoes: observacoes.trim() || undefined,
      });
      if (resultado === "vazia") {
        navigate("/nova-inseminacao", { state: { matrizId } });
        return;
      }
      navigate(`/matrizes/${matrizId}`);
    } catch (cause) {
      setErro(
        cause instanceof Error ? cause.message : "Não foi possível salvar.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (matriz === undefined || pendente === undefined) {
    return (
      <AppShell semBarra>
        <CabecalhoVoltar
          titulo="Registrar diagnóstico"
          voltar={matrizId ? `/matrizes/${matrizId}` : "/matrizes"}
        />
        <p className="px-4 py-6 text-sm text-muted-foreground">Carregando…</p>
      </AppShell>
    );
  }

  if (!matriz || !pendente) {
    return (
      <AppShell semBarra>
        <CabecalhoVoltar titulo="Registrar diagnóstico" voltar="/matrizes" />
        <div className="px-4 pt-4">
          <Vazio
            titulo="Sem inseminação pendente"
            texto="Registre uma nova inseminação antes do diagnóstico."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar
        titulo="Registrar diagnóstico"
        voltar={`/matrizes/${matrizId}`}
      />
      <form onSubmit={salvar} className="px-4 pb-32 pt-4">
        <Cartao className="space-y-5 p-4">
          <p className="text-sm text-muted-foreground">
            {matriz.nome}
            {matriz.brinco ? ` #${matriz.brinco}` : ""} · IA em{" "}
            {formatarDataBr(pendente.data)}
            {pendente.numero_tentativa > 1
              ? ` (tentativa ${pendente.numero_tentativa})`
              : ""}
          </p>
          {pendente.data_diagnostico_prevista ? (
            <p className="text-sm text-muted-foreground">
              Previsão para retorno:{" "}
              <span className="font-medium text-foreground">
                {formatarDataBr(pendente.data_diagnostico_prevista)}
              </span>
              . Registrar antes ou depois ajusta a previsão das próximas IAs
              desta matriz.
            </p>
          ) : null}
          <div>
            <span className="mb-1.5 block text-sm font-semibold">Resultado</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["prenhe", "Prenhe"],
                  ["vazia", "Vazia"],
                ] as const
              ).map(([idRes, rotulo]) => (
                <button
                  key={idRes}
                  type="button"
                  onClick={() => setResultado(idRes)}
                  className={cx(
                    "press min-h-14 rounded-md border text-base font-semibold",
                    resultado === idRes
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>
          <Campo rotulo="Data do diagnóstico">
            <input
              type="date"
              value={dataDiagnostico}
              min={pendente.data}
              max={hojeISO()}
              onChange={(e) => setDataDiagnostico(e.target.value)}
              className={inputClass}
            />
          </Campo>
          <label className="block">
            <span className="mb-1.5 flex gap-1 text-sm font-semibold">
              Observações{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className={textareaClass}
            />
          </label>
          {resultado === "prenhe" && (
            <p className="text-sm text-muted-foreground">
              A previsão de parto é calculada com 283 dias a partir da
              inseminação.
            </p>
          )}
          {resultado === "vazia" && (
            <p className="text-sm text-muted-foreground">
              Ao salvar, você pode registrar a repetição na tela seguinte.
            </p>
          )}
          {erro && (
            <p className="text-sm font-medium text-status-vazia">{erro}</p>
          )}
        </Cartao>
        <div className="mt-4">
          <Botao type="submit" disabled={salvando}>
            {salvando
              ? "Salvando…"
              : resultado === "vazia"
                ? "Salvar e repetir"
                : "Salvar diagnóstico"}
          </Botao>
        </div>
      </form>
    </AppShell>
  );
}