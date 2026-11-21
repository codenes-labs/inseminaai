import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Wand2 } from "lucide-react";
import type { Papel } from "../../lib/auth-types";
import { Botao, Cartao, cx, inputClass } from "../../components/ui";
import {
  gerarSenhaSugerida,
  senhaNovaValida,
} from "../../features/conta/domain/gerar-senha";
import type { MembroCadastro } from "../../features/conta/infrastructure/cadastro-membros-api";
import {
  CADASTRO_ADMIN_ID,
  CADASTRO_DEMO_ID,
  cadastroBloqueiaExclusao,
  cadastroBloqueiaInativacao,
  usuarioProtegidoSistema,
} from "../../features/plataforma/domain/cadastros-sistema";
import { cadastroPermiteMultiplosAcessos } from "../../features/plataforma/domain/tipo-cadastro-plataforma";
import {
  atualizarCadastroPlataformaApi,
  atualizarMembroPlataformaCadastroApi,
  criarMembroPlataformaCadastroApi,
  excluirCadastroPlataformaApi,
  excluirMembroPlataformaCadastroApi,
  listarMembrosPlataformaCadastroApi,
  obterCadastroPlataformaApi,
} from "../../features/plataforma/infrastructure/plataforma-api";
import type { WebCadastrosLayoutContext } from "./WebCadastrosLayout";

const PAPEIS: Papel[] = ["inseminador", "administrador"];

export function WebCadastroDetalhe() {
  const navigate = useNavigate();
  const { cadastroId } = useParams<{ cadastroId: string }>();
  const { recarregarListaCadastros } =
    useOutletContext<WebCadastrosLayoutContext>();
  const [bloqueiaExcluir, setBloqueiaExcluir] = useState(false);
  const [bloqueiaInativar, setBloqueiaInativar] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"autonomo" | "empresa">("autonomo");
  const [ativa, setAtiva] = useState(true);
  const [erroCadastro, setErroCadastro] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState("");
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);
  const [carregandoCadastro, setCarregandoCadastro] = useState(true);

  const [membros, setMembros] = useState<MembroCadastro[]>([]);
  const [erroAcessos, setErroAcessos] = useState("");
  const [sucessoAcesso, setSucessoAcesso] = useState("");
  const [nomeNovo, setNomeNovo] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [senhaNovo, setSenhaNovo] = useState("");
  const [papelNovo, setPapelNovo] = useState<Papel>("inseminador");
  const [exibirSenhaNovo, setExibirSenhaNovo] = useState(false);
  const [salvandoAcesso, setSalvandoAcesso] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPapel, setEditPapel] = useState<Papel>("inseminador");
  const [editSenha, setEditSenha] = useState("");
  const [exibirSenhaEdicao, setExibirSenhaEdicao] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const variosAcessos = cadastroPermiteMultiplosAcessos(tipo);

  const carregarCadastro = useCallback(async () => {
    if (!cadastroId) {
      setErroCadastro("Cadastro inválido.");
      setCarregandoCadastro(false);
      return;
    }
    setCarregandoCadastro(true);
    setErroCadastro("");
    try {
      const dados = await obterCadastroPlataformaApi(cadastroId);
      setNome(dados.nome);
      setTipo(dados.tipo === "empresa" ? "empresa" : "autonomo");
      setAtiva(dados.ativa);
      setBloqueiaExcluir(cadastroBloqueiaExclusao(dados.id));
      setBloqueiaInativar(cadastroBloqueiaInativacao(dados.id));
    } catch {
      setErroCadastro("Não foi possível carregar o cadastro.");
    } finally {
      setCarregandoCadastro(false);
    }
  }, [cadastroId]);

  const carregarAcessos = useCallback(async () => {
    if (!cadastroId) {
      return;
    }
    setErroAcessos("");
    try {
      const lista = await listarMembrosPlataformaCadastroApi(cadastroId);
      setMembros(lista);
    } catch {
      setErroAcessos("Não foi possível carregar os acessos.");
    }
  }, [cadastroId]);

  useEffect(() => {
    void carregarCadastro();
    void carregarAcessos();
  }, [carregarCadastro, carregarAcessos]);

  async function salvarCadastro(e: FormEvent) {
    e.preventDefault();
    if (!cadastroId) {
      return;
    }
    setErroCadastro("");
    setSucessoCadastro("");
    setSalvandoCadastro(true);
    try {
      await atualizarCadastroPlataformaApi(cadastroId, { nome, tipo, ativa });
      setSucessoCadastro("Cliente salvo.");
      await recarregarListaCadastros();
      await carregarCadastro();
    } catch (caught) {
      setErroCadastro(caught instanceof Error ? caught.message : "Erro ao salvar.");
    } finally {
      setSalvandoCadastro(false);
    }
  }

  async function alternarCadastroAtivo(novoAtivo: boolean) {
    if (!cadastroId) {
      return;
    }
    setErroCadastro("");
    setSucessoCadastro("");
    setSalvandoCadastro(true);
    try {
      await atualizarCadastroPlataformaApi(cadastroId, {
        nome,
        tipo,
        ativa: novoAtivo,
      });
      setAtiva(novoAtivo);
      setSucessoCadastro(novoAtivo ? "Cliente reativado." : "Cliente inativado.");
      await recarregarListaCadastros();
    } catch (caught) {
      setErroCadastro(caught instanceof Error ? caught.message : "Erro ao atualizar.");
    } finally {
      setSalvandoCadastro(false);
    }
  }

  function sugerirSenhaNovo() {
    const s = gerarSenhaSugerida();
    setSenhaNovo(s);
    setExibirSenhaNovo(true);
  }

  function sugerirSenhaEdicao() {
    const s = gerarSenhaSugerida();
    setEditSenha(s);
    setExibirSenhaEdicao(true);
  }

  async function criarAcesso(e: FormEvent) {
    e.preventDefault();
    if (!cadastroId) {
      return;
    }
    if (!senhaNovaValida(senhaNovo)) {
      setErroAcessos("A senha inicial deve ter pelo menos 8 caracteres.");
      return;
    }
    setErroAcessos("");
    setSucessoAcesso("");
    setSalvandoAcesso(true);
    try {
      await criarMembroPlataformaCadastroApi(cadastroId, {
        nome: nomeNovo,
        email: emailNovo,
        senha: senhaNovo,
        papel: papelNovo,
      });
      setSucessoAcesso("Acesso criado.");
      setNomeNovo("");
      setEmailNovo("");
      setSenhaNovo("");
      setPapelNovo("inseminador");
      setExibirSenhaNovo(false);
      await carregarAcessos();
    } catch (caught) {
      setErroAcessos(caught instanceof Error ? caught.message : "Erro ao criar.");
    } finally {
      setSalvandoAcesso(false);
    }
  }

  async function alternarAtivo(membro: MembroCadastro) {
    if (!cadastroId) {
      return;
    }
    setErroAcessos("");
    setSucessoAcesso("");
    try {
      await atualizarMembroPlataformaCadastroApi(cadastroId, membro.userId, {
        ativo: !membro.ativo,
      });
      await carregarAcessos();
      setSucessoAcesso(membro.ativo ? "Acesso desativado." : "Acesso reativado.");
    } catch (caught) {
      setErroAcessos(caught instanceof Error ? caught.message : "Erro ao atualizar.");
    }
  }

  function iniciarEdicao(membro: MembroCadastro) {
    setEditandoId(membro.userId);
    setEditNome(membro.nome);
    setEditEmail(membro.email);
    setEditPapel(membro.papel);
    setEditSenha("");
    setExibirSenhaEdicao(false);
    setErroAcessos("");
  }

  async function salvarEdicao(e: FormEvent) {
    e.preventDefault();
    if (!cadastroId || !editandoId) {
      return;
    }
    if (editSenha && !senhaNovaValida(editSenha)) {
      setErroAcessos("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setSalvandoEdicao(true);
    setErroAcessos("");
    setSucessoAcesso("");
    try {
      await atualizarMembroPlataformaCadastroApi(cadastroId, editandoId, {
        nome: editNome,
        email: editEmail,
        ...(variosAcessos ? { papel: editPapel } : {}),
        senha: editSenha || undefined,
      });
      setEditandoId(null);
      setSucessoAcesso("Acesso atualizado.");
      await carregarAcessos();
    } catch (caught) {
      setErroAcessos(caught instanceof Error ? caught.message : "Erro ao salvar.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function excluirAcesso(membro: MembroCadastro) {
    if (!cadastroId) {
      return;
    }
    if (
      !window.confirm(
        `Excluir o acesso de ${membro.nome}? O usuário perde o login neste cliente.`,
      )
    ) {
      return;
    }
    setErroAcessos("");
    setSucessoAcesso("");
    try {
      await excluirMembroPlataformaCadastroApi(cadastroId, membro.userId);
      if (editandoId === membro.userId) {
        setEditandoId(null);
      }
      setSucessoAcesso("Acesso excluído.");
      await carregarAcessos();
    } catch (caught) {
      setErroAcessos(caught instanceof Error ? caught.message : "Erro ao excluir.");
    }
  }

  async function excluirCliente() {
    if (!cadastroId || bloqueiaExcluir) {
      return;
    }
    if (
      !window.confirm(
        "Excluir este cliente e todos os dados dele? Essa ação não pode ser desfeita.",
      )
    ) {
      return;
    }
    try {
      await excluirCadastroPlataformaApi(cadastroId);
      await recarregarListaCadastros();
      navigate("/admin/cadastros");
    } catch (caught) {
      setErroCadastro(caught instanceof Error ? caught.message : "Erro ao excluir.");
    }
  }

  return (
    <>
      <Link
        to="/admin/cadastros"
        className="press mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" />
        Voltar à lista
      </Link>
      <div className="mb-6 flex gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Building2 className="size-7" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{nome || "Cliente"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {variosAcessos
              ? "Empresa: vários logins por perfil (administrador ou inseminador)."
              : "Autônomo: um único login. Ative, edite, altere a senha ou exclua o cliente."}
          </p>
        </div>
      </div>

      {erroAcessos ? (
        <p className="mb-4 rounded-lg bg-status-vazia/15 px-3 py-2 text-sm text-status-vazia">
          {erroAcessos}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={salvarCadastro}>
        <Cartao className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Dados do cliente</h2>
          {carregandoCadastro ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <>
              <label className="block text-sm font-semibold">
                Nome do cadastro
                <input
                  className={`${inputClass} mt-1`}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </label>
              <div>
                <span className="mb-1.5 block text-sm font-semibold">Tipo</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["autonomo", "empresa"] as const).map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setTipo(opcao)}
                      className={cx(
                        "press min-h-11 rounded-md border text-sm font-semibold",
                        tipo === opcao
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card",
                      )}
                    >
                      {opcao === "autonomo" ? "Autônomo" : "Empresa"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: {ativa ? "ativo" : "inativo"}
              </p>
              {erroCadastro ? (
                <p className="text-sm text-status-vazia">{erroCadastro}</p>
              ) : null}
              {sucessoCadastro ? (
                <p className="text-sm text-brand">{sucessoCadastro}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Botao type="submit" disabled={salvandoCadastro}>
                  {salvandoCadastro ? "Salvando…" : "Salvar alterações"}
                </Botao>
                {ativa && !bloqueiaInativar ? (
                  <Botao
                    type="button"
                    variante="suave"
                    disabled={salvandoCadastro}
                    onClick={() => void alternarCadastroAtivo(false)}
                  >
                    Inativar cliente
                  </Botao>
                ) : null}
                {!ativa ? (
                  <Botao
                    type="button"
                    variante="suave"
                    disabled={salvandoCadastro}
                    onClick={() => void alternarCadastroAtivo(true)}
                  >
                    Reativar cliente
                  </Botao>
                ) : null}
                {!bloqueiaExcluir ? (
                  <Botao
                    type="button"
                    variante="suave"
                    onClick={() => void excluirCliente()}
                  >
                    Excluir cliente
                  </Botao>
                ) : (
                  <p className="self-center text-xs text-muted-foreground">
                    {cadastroId === CADASTRO_ADMIN_ID
                      ? "Cadastro administrador — não pode ser excluído nem inativado."
                      : cadastroId === CADASTRO_DEMO_ID
                        ? "Cadastro demo — pode inativar, mas não excluir."
                        : "Cadastro do sistema — não pode ser excluído."}
                  </p>
                )}
              </div>
            </>
          )}
        </Cartao>
      </form>

      <div
        className={cx(
          "mt-8 grid gap-8",
          variosAcessos ? "lg:grid-cols-2" : "max-w-xl",
        )}
      >
        {variosAcessos ? (
          <Cartao className="p-5">
            <h2 className="text-lg font-semibold">Novo acesso</h2>
            <form className="mt-4 space-y-3" onSubmit={criarAcesso}>
              <label className="block text-sm font-semibold">
                Nome
                <input
                  className={`${inputClass} mt-1`}
                  value={nomeNovo}
                  onChange={(e) => setNomeNovo(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-semibold">
                E-mail (login)
                <input
                  type="email"
                  className={`${inputClass} mt-1`}
                  value={emailNovo}
                  onChange={(e) => setEmailNovo(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-semibold">
                Senha inicial
                <input
                  type={exibirSenhaNovo ? "text" : "password"}
                  className={`${inputClass} mt-1`}
                  value={senhaNovo}
                  onChange={(e) => setSenhaNovo(e.target.value)}
                  required
                  minLength={8}
                />
              </label>
              <Botao type="button" variante="suave" onClick={sugerirSenhaNovo}>
                <Wand2 className="size-5" />
                Gerar senha sugerida
              </Botao>
              <div>
                <span className="mb-1.5 block text-sm font-semibold">Papel</span>
                <div className="grid grid-cols-2 gap-2">
                  {PAPEIS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPapelNovo(p)}
                      className={cx(
                        "press min-h-11 rounded-md border text-sm font-semibold",
                        papelNovo === p
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card",
                      )}
                    >
                      {p === "administrador" ? "Administrador" : "Inseminador"}
                    </button>
                  ))}
                </div>
              </div>
              <Botao type="submit" disabled={salvandoAcesso}>
                {salvandoAcesso ? "Criando…" : "Criar acesso"}
              </Botao>
            </form>
          </Cartao>
        ) : null}

        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">
            {variosAcessos ? "Acessos existentes" : "Acesso do autônomo"}
          </h2>
          {sucessoAcesso ? (
            <p className="mt-3 text-sm text-brand">{sucessoAcesso}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {membros.length === 0 ? (
              <li className="text-muted-foreground">Nenhum acesso.</li>
            ) : (
              membros.map((membro) => (
                <li
                  key={membro.userId}
                  className="rounded-lg border border-border px-3 py-3"
                >
                  {editandoId === membro.userId ? (
                    <form className="space-y-2" onSubmit={salvarEdicao}>
                      <input
                        className={inputClass}
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        required
                      />
                      <input
                        type="email"
                        className={inputClass}
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                      {variosAcessos ? (
                        <div className="grid grid-cols-2 gap-2">
                          {PAPEIS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setEditPapel(p)}
                              className={cx(
                                "press min-h-9 rounded-md border text-xs font-semibold",
                                editPapel === p
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border",
                              )}
                            >
                              {p === "administrador" ? "Admin" : "Inseminador"}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <input
                        type={exibirSenhaEdicao ? "text" : "password"}
                        className={inputClass}
                        placeholder="Nova senha (opcional)"
                        value={editSenha}
                        onChange={(e) => setEditSenha(e.target.value)}
                        minLength={8}
                      />
                      <Botao type="button" variante="suave" onClick={sugerirSenhaEdicao}>
                        <Wand2 className="size-4" />
                        Gerar senha
                      </Botao>
                      <div className="flex flex-wrap gap-2">
                        <Botao type="submit" disabled={salvandoEdicao}>
                          {salvandoEdicao ? "Salvando…" : "Salvar"}
                        </Botao>
                        <button
                          type="button"
                          className="press text-sm text-muted-foreground"
                          onClick={() => setEditandoId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-medium">{membro.nome}</span>
                        <span className="mt-0.5 block text-muted-foreground">
                          {membro.email} · {membro.papel}
                          {!membro.ativo ? " · inativo" : ""}
                          {usuarioProtegidoSistema(membro.userId) ? " · sistema" : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="press text-sm font-medium text-primary"
                          onClick={() => iniciarEdicao(membro)}
                        >
                          Editar
                        </button>
                        {!usuarioProtegidoSistema(membro.userId) ? (
                          <>
                            <button
                              type="button"
                              className="press text-sm font-medium text-primary"
                              onClick={() => void alternarAtivo(membro)}
                            >
                              {membro.ativo ? "Desativar" : "Reativar"}
                            </button>
                            {variosAcessos ? (
                              <button
                                type="button"
                                className="press text-sm font-medium text-status-vazia"
                                onClick={() => void excluirAcesso(membro)}
                              >
                                Excluir
                              </button>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </Cartao>
      </div>
    </>
  );
}