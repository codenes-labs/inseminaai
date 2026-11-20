import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  inputClass,
  textareaCampoClass,
} from "../components/ui";
import type { TipoCadastro } from "../features/cadastros-auxiliares/infrastructure/cadastros-auxiliares-api";
import {
  atualizarInseminadorApi,
  atualizarLoteApi,
  atualizarReprodutorApi,
  criarInseminadorApi,
  criarLoteApi,
  criarReprodutorApi,
  listarInseminadoresApi,
  listarLotesApi,
  listarReprodutoresApi,
} from "../features/cadastros-auxiliares/infrastructure/cadastros-auxiliares-api";

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function CadastroAuxiliarForm() {
  const { tipo, id } = useParams();
  const cadastroTipo = tipo as TipoCadastro | undefined;
  const editar = Boolean(id);
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [codigoSemen, setCodigoSemen] = useState("");
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(editar);
  const [salvando, setSalvando] = useState(false);

  const voltar = cadastroTipo ? `/mais/${cadastroTipo}` : "/mais";
  const titulo =
    cadastroTipo === "reprodutores"
      ? editar
        ? "Editar reprodutor"
        : "Novo reprodutor"
      : cadastroTipo === "inseminadores"
        ? editar
          ? "Editar inseminador"
          : "Novo inseminador"
        : editar
          ? "Editar lote"
          : "Novo lote";

  useEffect(() => {
    if (!editar || !id || !cadastroTipo) return;
    let ativo = true;
    void (async () => {
      try {
        if (cadastroTipo === "reprodutores") {
          const lista = await listarReprodutoresApi(false);
          const item = lista.find((r) => r.id === id);
          if (!item) {
            setErro("Não encontrado.");
            return;
          }
          setNome(item.nome);
          setRaca(item.raca ?? "");
          setCodigoSemen(item.codigo_semen ?? "");
        } else if (cadastroTipo === "inseminadores") {
          const lista = await listarInseminadoresApi(false);
          const item = lista.find((r) => r.id === id);
          if (!item) {
            setErro("Não encontrado.");
            return;
          }
          setNome(item.nome);
        } else {
          const lista = await listarLotesApi(false);
          const item = lista.find((l) => l.id === id);
          if (!item) {
            setErro("Não encontrado.");
            return;
          }
          setNome(item.nome);
          setDataInicio(item.data_inicio.slice(0, 10));
          setObservacoes(item.observacoes ?? "");
        }
      } catch {
        if (ativo) setErro("Não foi possível carregar.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [cadastroTipo, editar, id]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!cadastroTipo) return;
    setErro("");
    setSalvando(true);
    try {
      if (cadastroTipo === "reprodutores") {
        if (editar && id) {
          await atualizarReprodutorApi(id, {
            nome,
            raca: raca.trim() || null,
            codigo_semen: codigoSemen.trim() || null,
          });
        } else {
          await criarReprodutorApi({
            nome,
            raca: raca.trim() || undefined,
            codigo_semen: codigoSemen.trim() || undefined,
          });
        }
      } else if (cadastroTipo === "inseminadores") {
        if (editar && id) {
          await atualizarInseminadorApi(id, { nome });
        } else {
          await criarInseminadorApi({ nome });
        }
      } else if (editar && id) {
        await atualizarLoteApi(id, {
          nome,
          data_inicio: dataInicio,
          observacoes: observacoes.trim() || null,
        });
      } else {
        await criarLoteApi({
          nome,
          data_inicio: dataInicio,
          observacoes: observacoes.trim() || undefined,
        });
      }
      navigate(voltar);
    } catch (cause) {
      setErro(
        cause instanceof Error ? cause.message : "Não foi possível salvar.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function desativar() {
    if (!editar || !id || !cadastroTipo) return;
    setSalvando(true);
    try {
      if (cadastroTipo === "reprodutores") {
        await atualizarReprodutorApi(id, { ativo: false });
      } else if (cadastroTipo === "inseminadores") {
        await atualizarInseminadorApi(id, { ativo: false });
      } else {
        await atualizarLoteApi(id, { ativo: false });
      }
      navigate(voltar);
    } catch (cause) {
      setErro(
        cause instanceof Error ? cause.message : "Não foi possível desativar.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo={titulo} voltar={voltar} />
      <form className="space-y-4 px-4 py-4" onSubmit={enviar}>
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            <Campo rotulo="Nome *">
              <input
                className={inputClass}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={salvando}
              />
            </Campo>
            {cadastroTipo === "reprodutores" && (
              <>
                <Campo rotulo="Raça" opcional>
                  <input
                    className={inputClass}
                    value={raca}
                    onChange={(e) => setRaca(e.target.value)}
                    disabled={salvando}
                  />
                </Campo>
                <Campo rotulo="Código / palheta" opcional>
                  <input
                    className={inputClass}
                    value={codigoSemen}
                    onChange={(e) => setCodigoSemen(e.target.value)}
                    disabled={salvando}
                  />
                </Campo>
              </>
            )}
            {cadastroTipo === "lotes" && (
              <>
                <Campo rotulo="Data de início *">
                  <input
                    type="date"
                    className={inputClass}
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    disabled={salvando}
                  />
                </Campo>
                <Campo rotulo="Observações" opcional multilinha>
                  <textarea
                    className={textareaCampoClass}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    disabled={salvando}
                  />
                </Campo>
              </>
            )}
            {erro && (
              <p className="text-sm font-medium text-status-vazia">{erro}</p>
            )}
            <Botao type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </Botao>
            {editar && (
              <Botao
                type="button"
                variante="suave"
                disabled={salvando}
                onClick={() => void desativar()}
              >
                Desativar
              </Botao>
            )}
            <Link to={voltar} className="block text-center text-sm text-brand">
              Cancelar
            </Link>
          </>
        )}
      </form>
    </AppShell>
  );
}