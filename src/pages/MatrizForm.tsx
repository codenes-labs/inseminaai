import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Hash, Tag } from "lucide-react";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  inputClass,
  textareaCampoClass,
} from "../components/ui";
import {
  atualizarMatrizApi,
  criarMatrizApi,
  obterMatrizApi,
} from "../features/matrizes/infrastructure/matrizes-api";

export function MatrizForm() {
  const { id } = useParams();
  const editar = Boolean(id);
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [brinco, setBrinco] = useState("");
  const [raca, setRaca] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(editar);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    void (async () => {
      try {
        const matriz = await obterMatrizApi(id);
        if (!ativo) return;
        if (!matriz) {
          setErro("Matriz não encontrada.");
          return;
        }
        setNome(matriz.nome);
        setBrinco(matriz.brinco);
        setRaca(matriz.raca ?? "");
        setObservacoes(matriz.observacoes ?? "");
      } catch {
        if (ativo) setErro("Não foi possível carregar.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      if (editar && id) {
        await atualizarMatrizApi(id, {
          nome,
          brinco: brinco.trim() || null,
          raca: raca.trim() || null,
          observacoes: observacoes.trim() || null,
        });
        navigate(`/matrizes/${id}`);
      } else {
        const criada = await criarMatrizApi({
          nome,
          brinco: brinco.trim() || undefined,
          raca: raca.trim() || undefined,
          observacoes: observacoes.trim() || undefined,
        });
        navigate(`/matrizes/${criada.id}`);
      }
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
      <CabecalhoVoltar
        titulo={editar ? "Editar matriz" : "Nova matriz"}
        voltar={editar && id ? `/matrizes/${id}` : "/matrizes"}
      />
      <form className="space-y-4 px-4 py-4" onSubmit={enviar}>
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            <Campo rotulo="Nome *" icone={<Tag className="size-5" strokeWidth={1.75} />}>
              <input
                className={inputClass}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Madame"
                disabled={salvando}
              />
            </Campo>
            <Campo rotulo="Brinco" icone={<Hash className="size-5" strokeWidth={1.75} />}>
              <input
                className={inputClass}
                value={brinco}
                onChange={(e) => setBrinco(e.target.value)}
                placeholder="Opcional"
                disabled={salvando}
              />
            </Campo>
            <Campo rotulo="Raça">
              <input
                className={inputClass}
                value={raca}
                onChange={(e) => setRaca(e.target.value)}
                placeholder="Opcional"
                disabled={salvando}
              />
            </Campo>
            <Campo rotulo="Observações" multilinha>
              <textarea
                className={textareaCampoClass}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                disabled={salvando}
              />
            </Campo>
            {erro && (
              <p className="text-sm font-medium text-status-vazia">{erro}</p>
            )}
            <Botao type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </Botao>
          </>
        )}
      </form>
    </AppShell>
  );
}